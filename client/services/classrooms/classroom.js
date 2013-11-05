angular.module('pace').factory('Classroom', function(Backbone, apiConfig) {
    return Backbone.Model.extend({
        urlRoot: apiConfig.toAPIUrl('classrooms/'),
    });
});
