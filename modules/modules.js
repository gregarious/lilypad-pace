var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});

// backbone relational not implemented yet

var backbone = angular.module('backbone', ['underscore']);
underscore.factory('Backbone', function() {
    return window.Backbone;
});