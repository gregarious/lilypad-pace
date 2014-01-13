angular.module('pace').factory('Classroom', function(_, moment, Backbone, $q, Student, apiConfig, timeTracker) {

    return Backbone.RelationalModel.extend({
        urlRoot: apiConfig.toAPIUrl('classrooms/'),

        relations: [
            {
                key: 'students',
                relatedModel: Student,
                reverseRelation: {
                    key: 'classroom',
                    includeInJSON: false
                },
                type: Backbone.HasMany,
            }
        ],
    });
});
