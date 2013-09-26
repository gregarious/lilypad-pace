// Defines a customized version of Backbone and encapsulates it as an Angular
// service
angular.module('backbone', ['underscore']).
    provider('Backbone', function(_) {
        /**
         * Return the Backbone object with the following changes:
         * 1. Backbone.ajax: use $http
         * 2. Backbone.Model.parse: convert server snake-case to camel-case
         * 3. Backbone.Model.toJSON: convert camel-case to server-friendly snake-case
         * 4. Backbone.PersistentModel and Backbone.PersistentCollection definitions
         */
        this.$get = function($http) {
            // assumes Backbone is globally available
            var Backbone = window.Backbone;
            patchModelParsing(Backbone);
            definePersistentExtensions(Backbone);
            patchAjax(Backbone, $http);

            Backbone.$ = {};    // BB.localStorage assumes this is an Object
            return Backbone;
        };

        /**
         * Define two extension classes to allow Models/Collections to
         * retain persistent copies of server resources:
         *
         * PersistentCollection: A Backbone.localStorage-supported Collection
         *     that refers routes all fetch calls to the local store before
         *     fetching remotely.
         *
         * PersistentModel: routes all fetch/save/destroy calls through a
         *     local store defined on an instance's collection before making
         *     the remote calls. These models *must* belong to a
         *     PersistentCollection.
         */
        function definePersistentExtensions(Backbone) {
            Backbone.PersistentModel = Backbone.Model.extend({
                initialize: function(attributes, options) {
                    options = options || {};
                    if(!options.collection || !(options.collection instanceof Backbone.PersistentCollection)) {
                        throw Error("Configuration error: PersistentModel must be linked to PersistentCollection");
                    }
                },

                // to be used when an object should be saved without notifying the server
                localSave: function() {
                    method = this.collection.isPersisted(this) ? 'update' : 'create';
                    Backbone.localSync(method, this);
                },

                // All ajax sync methods but 'destory' involve returning the current
                // state of the relevant resource. As a result, we need to ensure we
                // save any model changes this response dictates: "The server is
                // always right".
                //
                // This helper method wraps the fetch/save calls to acheive this.
                _wrapSuccess: function(options) {
                    options = options || {};

                    // create wrapper for persisting changes to a model made in
                    // Backbone's internal post-AJAX response handling
                    var origSuccess = options.success;
                    options.success = function(model, response, options) {
                        // origSuccess should have been set up in fetch/save.
                        // do it first so any response-driven model changes get set
                        if (origSuccess) {
                            origSuccess(model, response, options);
                        }
                        model.localSave();
                    };
                },

                fetch: function(options) {
                    this._wrapSuccess(options);
                    Backbone.Model.prototype.fetch.call(this, options);
                },

                save: function(attributes, options) {
                    this._wrapSuccess(options);
                    Backbone.Model.prototype.save.call(this, attributes, options);
                },

                sync: function(method, model, options) {
                    // TODO: need to fix the option situation. BB internal callbacks need
                    // executed for both, but user ones should only be executed after remote sync
                    Backbone.localSync(method, model, options);
                    return Backbone.ajaxSync(method, model, options);
                }
            });

            Backbone.PersistentCollection = Backbone.Collection.extend({
                initialize: function() {
                    if (!this.localStorage) {
                        throw Error("Configuration error: PersistentCollection needs `localStorage` defined");
                    }
                },

                fetch: function(options) {
                    options = options || {};

                    // create wrapper for persisting changes to a model made in
                    // Backbone's internal post-AJAX response handling
                    var origSuccess = options.success;
                    options.success = function(collection, response, options) {
                        collection.each(function(model) {
                            model.localSave();
                        });
                        if (origSuccess) {
                            origSuccess(collection, response, options);
                        }
                    };

                    Backbone.Collection.prototype.fetch.call(this, options);
                },

                sync: function(method, collection, options) {
                    if (method !== "read") {
                        throw Error("Should only be using the 'read' sync method");
                    }

                    // TODO: need to fix the option situation. BB internal callbacks need
                    // executed for both, but user ones should only be executed after remote sync
                    Backbone.localSync(method, collection, options);
                    return Backbone.ajaxSync(method, collection, options);
                },

                isPersisted: function(model) {
                    return this.localStorage.find(model) !== null;
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
