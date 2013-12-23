angular.module('pace')

.factory('Classroom', function(_, moment, Backbone, $q, Student, apiConfig, timeTracker) {

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
})

.factory('classroomDataStore', function(_, Backbone, Classroom, $q, apiConfig) {
    var ClassroomCollection = Backbone.Collection.extend({
        model: Classroom,
        url: apiConfig.toAPIUrl('classrooms/'),
        comparator: 'name',
    });

    return {
        classrooms: new ClassroomCollection(),

        /**
         * Fetches classrooms and returns a promise for the resulting
         * Collection.
         *
         * @return {Promise}    Promise for a Collection
         */
        load: function() {
            var deferredFetch = $q.defer();
            this.classrooms.fetch({
                success: function(collection) {
                    deferredFetch.resolve(collection);
                },
                error: function(collection, response) {
                    deferredFetch.reject(response);
                }
            });
            return deferredFetch.promise;
        },


    };
});
