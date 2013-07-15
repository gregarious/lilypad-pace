/* Turn third-party packages into modules */

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
