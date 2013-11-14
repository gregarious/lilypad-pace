// Defines a customized version of Backbone and encapsulates it as an Angular
// service
angular.module('backbone', ['underscore']).
    provider('Backbone', function(_) {
        /**
         * Return the Backbone object with the following changes:
         * 1. Backbone.ajax: use $http
         * 2. Backbone.RelationalModel.parse: convert server snake-case to camel-case
         * 3. Backbone.RelationalModel.toJSON: convert camel-case to server-friendly snake-case
         * 4. Backbone.Collection: supports dataStore property that enables mirroring
         *     all resource operations locally (fetch, save, & destroy)
         */
        this.$get = function($http, authManager) {
            // assumes Backbone is globally available
            var Backbone = window.Backbone;
            Backbone.$ = {};    // Some BB extensions assume this is an Object

            configureBackboneRelational(Backbone);
            patchModelParsing(Backbone);
            patchAjax(Backbone, $http, authManager);

            return Backbone;
        };

        function configureBackboneRelational(Backbone) {
            // declare a non-window global object for model scope (for BB-relational)
            Backbone.AppModels = {};
            Backbone.Relational.store.removeModelScope(window);
            Backbone.Relational.store.addModelScope(Backbone.AppModels);

            // add a warning when accessing a relation that has not yet been fetched
            var originalGet = Backbone.RelationalModel.prototype.get;
            Backbone.RelationalModel.prototype.get = function(attribute, options) {
                var value = originalGet.call(this, attribute);
                if (value === null) {
                    var relation = this.getRelation(attribute);
                    if (relation && (relation.keyId || relation.keyId === 0)) {
                        console.warn("Calling `get` for unfetched relation `" + attribute + "`");
                    }
                }
                return value;
            };
        }

        /**
         * Monkey-patch Backbone.RelationalModel.parse and Backbone.RelationalModel.toJSON to
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

            var originalToJSON = Backbone.RelationalModel.prototype.toJSON;
            Backbone.RelationalModel = Backbone.RelationalModel.extend({
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
        function patchAjax(Backbone, $http, authManager) {
            // The Backbone.ajax option hash keys the patch officially supports
            var expectedAjaxOptions = [
                'contentType', 'data', 'dataType', 'error', 'processData',
                'success', 'type', 'url'
            ];

            // The Backbone.sync option hash keys the patch officially supports
            var expectedSyncOptions = [
                'emulateHTTP', 'emulateJSON', 'parse', 'validate', 'collection',
                'add', 'merge', 'remove', 'update'
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
                    data: jqSettings.data,
                    headers: {'Authorization': authManager.getAuthToken()}
                };

                if (jqSettings.contentType) {
                    angSettings.headers['Content-Type'] = jqSettings.contentType;
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
