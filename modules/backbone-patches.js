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

    // TODO: remove this: only for development
    var origSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options = options || {};
        options.async = false;
        return origSync(method, model, options);
    };
})();
