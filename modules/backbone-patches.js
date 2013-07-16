/* 
This file includes monkey-patches to Backbone models so they play
a bit nicer with our API. Patches include:

	- Automatic snake-to-camel case conversion in Model.parse
	- Automatic camel-to-snake case conversion in Model.toJSON
	- Automatic serialization of sub-models if they include toJSON
	- (Temporary for development) All Backbone.sync calls are sychronous

Note that the automatic sub-model serialization will cause an infinite
loop if a cycle appears in the sub-model chain. This should be revisited
if sub-models start getting more complex.
*/

(function(){
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

    // Monkey-patch parse and toJSON to handle case conversions between client
    // and server case conventions (snakecase on server, camelcase on client)
    var originalToJSON = Backbone.Model.prototype.toJSON;
    Backbone.Model = Backbone.Model.extend({
        parse: function(response, options) {
            var camelResponse = {};
            // TODO: use proper modularized version of underscore
            _.each(_.pairs(response), function(kv_pair) {
                camelResponse[camelize(kv_pair[0])] = kv_pair[1];
            });
            return camelResponse;
        },
        toJSON: function() {
            var data = originalToJSON.apply(this, arguments);
            var snakeData = {};
            // TODO: use proper modularized version of underscore
            _.each(_.pairs(data), function(kv_pair) {
                // first serialize any sub models
                var value = kv_pair[1];
                if(value && value.toJSON) {
                    value = value.toJSON();
                }

                // now transform key
                snakeData[decamelize(kv_pair[0])] = value;
            });
            return snakeData;
        }
    });

    // These are the option keys allowed to be passed into Backbone.ajax 
    // with the patch below.
    var expectedAjaxOptions = [
        'contentType', 'data', 'dataType', 'error', 'processData',
        'success', 'type', 'url'
    ];

    // Options passed into Backbone.sync that end up bleeding into $.ajax
    var expectedSyncOptions = [
        'emulateHTTP', 'emulateJSON', 'parse', 'validate', 'collection',
        'add', 'merge', 'remove'
    ];

    /* 
      Patch to have Backbone use Angular's $http for AJAX calls.

      We need to actually hook this up inside a the Backbone provider 
      definition in order to get access to $http, but to keep that
      module clean all the logic is in here. To actually plug it in,
      just call Backbone._patchAjax($http) once a reference to $http 
      exists.
    */
    Backbone._patchAjax = function(httpProvider) {
        /**
         * Backbone.ajax override to use Angular's $http instead. Note that 
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
         *    objeects passed into the success and error callbacks.
         *
         * These limitations aren't problems as long as they're used in the context
         * of Backbone.ajax calls (at least as of Backbone v1.0.0).
         */
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
            var promise = httpProvider(angSettings);

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
    };
})();
