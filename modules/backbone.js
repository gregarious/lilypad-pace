// encapsulate Backbone in its own Angular module (it's still available
// globally, this is just good form)
angular.module('backbone', ['underscore']).
    factory('Backbone', function($http) {
        var Backbone = window.Backbone;
        Backbone._patchAjax($http);
        return Backbone;
    });
