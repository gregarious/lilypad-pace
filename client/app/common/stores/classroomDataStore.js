angular.module('pace').service('classroomDataStore', function(_, Backbone, Classroom, $q, apiConfig) {
    var ClassroomCollection = Backbone.Collection.extend({
        model: Classroom,
        url: apiConfig.toAPIUrl('classrooms/'),
        comparator: 'name',
    });

    this.classrooms = new ClassroomCollection();

    /**
     * Fetches classrooms and returns a promise for the resulting
     * Collection.
     *
     * @return {Promise}    Promise for a Collection
     */
    this.loadAccessibleClassrooms = function() {
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
    };

    /**
     * Clears currently stored classroom collection.
     */
    this.clear = function() {
        this.classrooms.reset();
    };
});
