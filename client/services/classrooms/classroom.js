angular.module('pace').factory('Classroom', function(Backbone) {
    return Backbone.Model.extend({
        urlRoot: '/pace/classrooms/',
    });
});
