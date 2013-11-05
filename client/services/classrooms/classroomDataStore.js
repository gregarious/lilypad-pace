angular.module('pace').factory('classroomDataStore', function(Backbone, Classroom, $q, apiConfig) {

    var AllClassroomCollection = Backbone.Collection.extend({
        model: Classroom,
        url: apiConfig.toAPIUrl('classrooms/'),
        comparator: 'name',
    });

    /** Public interface of service **/
    return {
        getAll: function() {
            // don't cache the promise: this is only called when user logs in
            var deferred = $q.defer();
            var collection = new AllClassroomCollection();

            collection.fetch({
                success: function(collection) {
                    deferred.resolve(collection);
                },
                error: function(err) {
                    deferred.reject(err);
                }
            });
            return deferred.promise;
        },
    };
});
