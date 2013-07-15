
// some setup work on Backbone to allow for ease transition from API server variable
// letter case conventions during serialization
(function(){
    // stolen from Ember.js
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

    // TODO: remove async: only for development
    var origSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options = options || {};
        options.async = false;
        return origSync(method, model, options);
    };
})();

var zepto = angular.module('zepto', []);
zepto.factory('Zepto', function() {
    return window.Zepto;
});

var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});

var backbone = angular.module('backbone', ['underscore']);
backbone.factory('Backbone', function() {
    return window.Backbone;
});

angular.module('moment', []).factory('moment', function() {
    return window.moment;
});
