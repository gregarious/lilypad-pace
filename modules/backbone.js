// Defines a customized version of Backbone and encapsulates it as an Angular
// service
angular.module('backbone', ['underscore']).
    provider('Backbone', function(_) {
        /**
         * Return the Backbone object with the following changes:
         * 1. Backbone.ajax: use $http
         * 2. Backbone.Model.parse: convert server snake-case to camel-case
         * 3. Backbone.Model.toJSON: convert camel-case to server-friendly snake-case
         * 4. Backbone.Collection: supports dataStore property that enables mirroring
         *     all resource operations locally (fetch, save, & destroy)
         */
        this.$get = function($http) {
            // assumes Backbone is globally available
            var Backbone = window.Backbone;
            patchModelParsing(Backbone);
            patchDataStore(Backbone);
            patchAjax(Backbone, $http);

            Backbone.$ = {};    // BB.localStorage assumes this is an Object
            return Backbone;
        };

        /**
         * Define two extension to Backbone allow Models/Collections to
         * retain persistent copies of server resources:
         *
         * 1. PersistentStore "class": A Backbone.localStorage-supported
         *     Collection designed to be used as a flat store of canonical
         *     model instances.
         *
         * 2. Backbone.sync extensions: Changes to sync functionality
         *     to integrate models and collections into using a
         *     PersistentStore.
         */
        function patchDataStore(Backbone) {
            /** utilities taken from backbone-localstorage for clietn-side id setting **/
            // Generate four random hex digits.
            function S4() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            };

            // Generate a pseudo-GUID by concatenating random hexadecimal.
            function guid() {
               return 'local-' + (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
            };

            /** Store constructor **/
            Backbone.PersistentStore = function(modelType, label) {
                if (!modelType && !label) {
                    throw Error("PersistentStore configuration error");
                }

                var storeCollection = new (Backbone.Collection.extend({
                    model: modelType,
                    localStorage: new Backbone.LocalStorage(label)
                }))();
                storeCollection.fetch();

                /**
                 * Returns a copy of the stored model with the id that matched
                 * the argument model's id.
                 *
                 * @param  {Model} model
                 * @return {Model}
                 */
                this.find = function(model) {
                    if (!model.id) {
                        return null;
                    }
                    var wasFound = true;
                    console.log('finding model %o', model);

                    var storeModel = storeCollection.get(model.id);
                    return storeModel;
                };

                /**
                 * Returns a copy of the stored models that pass the test by
                 * the provided filter function.
                 *
                 * @param  {Function} filterFn  Function that takes a model and
                 *                              returns true or false.
                 * @return {Array}              Array of models
                 */
                this.findAll = function(filterFn) {
                    console.log('finding all models that satisfy function %o', filterFn);
                    // needs to return cloned models
                    var models;
                    if (filterFn) {
                        models = storeCollection.filter(filterFn);
                    }
                    else {
                        models = storeCollection.models;
                    }
                    return _.map(models, function(model) {
                        return model.clone();
                    });
                };

                /**
                 * Saves a copy of the given model to the store. Will create
                 * a model if the given model's id isn't found in the store,
                 * otherwise it will update the found model.
                 *
                 * @param  {Model} model
                 */
                this.save = function(model) {
                    var storeModel = storeCollection.get(model.id);
                    if (storeModel) {
                        console.log('saving existing model for %o', model);
                        storeModel.set(_.clone(model.attributes));
                        storeModel.save();
                    }
                    else {
                        console.log('creating new model for %o', model);
                        storeCollection.create(model.clone());
                    }
                };

                /**
                 * Removes a model from the store which matches the argument
                 * model's id.
                 *
                 * @param  {Model} model
                 */
                this.remove = function(model) {
                    var storeModel = storeCollection.get(model.id);
                    if (!storeModel) {
                        return false;
                    }
                    storeModel.destroy();
                    console.log('removing model %o' + model);
                };
            };

            var origModel = Backbone.Model;
            Backbone.Model = Backbone.Model.extend({
                isNew: function(options) {
                    return toString().slice(0,6) === "local-" || origModel.prototype.isNew.call(this);
                },

                fetch: function(options) {
                    options = options ? _.clone(options) : {};
                    if (this.collection && this.collection.dataStore) {
                        var dataStore = this.collection.dataStore;
                        var success = options.success;
                        options.success = function(model, resp, options) {
                            console.log('saving server-response model to store');
                            dataStore.save(model);
                            if (success) success(model, resp, options);
                        };

                        // get store attribute
                        var storeModel = this.collection.dataStore.find(this);
                        if (storeModel) {
                            console.log('setting model attrs from store model');
                            this.set(storeModel);
                        }
                        else {
                            console.log('no model found in the store');
                        }
                    }
                    console.log('defering to ajax-based Model.fetch');
                    return origModel.prototype.fetch.call(this, options);
                },

                save: function(key, val, options) {
                    options = options ? _.clone(options) : {};

                    // take a page out of BB LocalStorage. Having null ids is bad for referencing.
                    // The post-save success callback will fix the id later
                    if (this.id !== 0 && !this.id) {
                        console.warn(this.id);
                        this.set(this.idAttribute, guid());
                        console.warn(this.id);
                    }

                    if (this.collection && this.collection.dataStore) {
                        var dataStore = this.collection.dataStore;
                        console.log('saving model to store');
                        this.collection.dataStore.save(this);
                        var success = options.success;
                        options.success = function(model, resp, options) {
                            console.log('saving server-response model to store');
                            dataStore.save(model);
                            if (success) success(model, resp, options);
                        };
                    }
                    console.log('defering to ajax-based Model.save');
                    return origModel.prototype.save.call(this, key, val, options);
                },

                destroy: function(options) {
                    options = options ? _.clone(options) : {};
                    if (this.collection && this.collection.dataStore) {
                        console.log('destroying store model');
                        this.collection.dataStore.remove(this);
                    }
                    console.log('defering to ajax-based Model.destroy');
                    return origModel.prototype.destroy.call(this, options);
                }
            });

            var origCollection = Backbone.Collection;
            Backbone.Collection = Backbone.Collection.extend({
                fetch: function(options) {
                    options = options ? _.clone(options) : {};
                    if (this.dataStore) {
                        var dataStore = this.dataStore;
                        var success = options.success;
                        options.success = function(collection, resp, options) {
                            console.log('saving server-response collection to store');
                            collection.each(function(model) {
                                dataStore.save(model);
                            });
                            if (success) success(collection, resp, options);
                        };

                        // get store filter
                        var filter = this.storeFilter || function() { return true; };
                        var storeModels = this.dataStore.findAll(filter);
                        if (storeModels && storeModels.length > 0) {
                            console.log('setting collection models from store collection');
                            this.set(storeModels);
                        }
                        else {
                            console.log('no applicable models found in store');
                        }
                    }
                    console.log('defering to ajax-based Collection.fetch');
                    return origCollection.prototype.fetch.call(this, options);
                }
            });
        }

        /**
         * Monkey-patch Backbone.Model.parse and Backbone.Model.toJSON to
         * handle case conversions between client and server case conventions
         * (snakecase on server, camelcase on client)
         */
        function patchModelParsing(Backbone) {
            // case conversion code stolen from Ember.js
            var STRING_CAMELIZE_REGEXP = (/(\-|_|\.|\s)+(.)?/g);
            var camelize = function(str) {
                return str.replace(STRING_CAMELIZE_REGEXP, function(match, separator, chr) {
                    return chr ? chr.toUpperCase() : '';
                })
                .replace(/^([A-Z])/, function(match, separator, chr) {
                    return match.toLowerCase();
                });
            };
            var STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
            var decamelize = function(str) {
                return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
            };

            var originalToJSON = Backbone.Model.prototype.toJSON;
            Backbone.Model = Backbone.Model.extend({
                parse: function(response, options) {
                    var camelResponse = {};
                    _.each(_.pairs(response), function(kv_pair) {
                        camelResponse[camelize(kv_pair[0])] = kv_pair[1];
                    });
                    return camelResponse;
                },
                toJSON: function() {
                    var data = originalToJSON.apply(this, arguments);
                    var snakeData = {};
                    _.each(_.pairs(data), function(kv_pair) {
                        // first serialize any sub models into stubs (don't go recursive)
                        var value = kv_pair[1];
                        if(value && value.id) {
                            value = {
                                'id': value.id,
                            };
                        }

                        // now transform key
                        snakeData[decamelize(kv_pair[0])] = value;
                    });
                    return snakeData;
                }
            });
        }

        /**
         * Override Backbone.ajax to use Angular's $http instead. Note that
         * this function doesn't aim to duplicate jQuery.ajax, just the parts
         * of it that Backbone uses. In particular, here are some of the known
         * limitations to the override:
         *
         * 1. A limited subset of $.ajax settings are allowed
         * 2. Values are assumed for a few settings keys (`dataType` and
         *    `processData`). An error will be thrown if unexpected values
         *    are found.
         * 3. Angular doesn't give access to the raw XHR object at the $http
         *    level, so this version of `ajax` returns Angular HttpPromise object
         *    instead of XHR objects. These HttpPromises also replace the xhr
         *    objects passed into the success and error callbacks.
         *
         * These limitations aren't problems as long as they're used in the context
         * of Backbone.ajax calls (at least as of Backbone v1.0.0).
         */
        function patchAjax(Backbone, $http) {
            // The Backbone.ajax option hash keys the patch officially supports
            var expectedAjaxOptions = [
                'contentType', 'data', 'dataType', 'error', 'processData',
                'success', 'type', 'url'
            ];

            // The Backbone.sync option hash keys the patch officially supports
            var expectedSyncOptions = [
                'emulateHTTP', 'emulateJSON', 'parse', 'validate', 'collection',
                'add', 'merge', 'remove'
            ];

            Backbone.ajax = function(jqSettings) {
                // Remove all Backbone specific options
                jqSettings = _.omit(jqSettings, expectedSyncOptions);

                // ensure keys are ones within the scope this patch was designed to work for
                _.each(_.keys(jqSettings), function(key) {
                    if (_.indexOf(expectedAjaxOptions, key) === -1) {
                        throw new Error('Using unhandled option "' + key + '" in Backbone.AJAX');
                    }
                });

                // sanity checks to make sure some assumptions about Backbone's use of $.ajax are true
                if (!_.isUndefined(jqSettings.dataType) && jqSettings.dataType !== 'json') {
                    throw new Error('Unexpected Backbone.ajax option value. `dataType` must be "json"');
                }
                if (!_.isUndefined(jqSettings.processData) && jqSettings.processData !== false) {
                    throw new Error('Unexpected Backbone.ajax option value. `processData` must be false');
                }

                var angSettings = {
                    url: jqSettings.url,
                    method: jqSettings.type,
                    data: jqSettings.data
                };

                if (jqSettings.contentType) {
                    angSettings.headers = {'Content-Type': jqSettings.contentType};
                }

                // return an HttpPromise object (note: this object is not the same as an XHR!)
                var promise = $http(angSettings);

                // if jQuery-style success callback is provided, attach a wrapped
                // version to the promise
                if (jqSettings.success) {
                    promise.success(function(data, status, headers, config) {
                        jqSettings.success(data, 'success', arguments);
                    });
                }

                // if jQuery-style error callback is provided, attach a wrapped
                // version to the promise
                if (jqSettings.error) {
                    promise.error(function(data, status, headers, config) {
                        jqSettings.error(arguments, 'error', undefined);
                    });
                }

                return promise;
            };
        }
    });
