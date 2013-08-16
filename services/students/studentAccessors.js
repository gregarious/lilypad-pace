angular.module('pace').factory('studentAccessors', function(Backbone, Student, $q) {
    var StudentCollection = Backbone.Collection.extend({
        model: Student,
        url: '/pace/students'
    });

    var _allStudents = new StudentCollection();
    var beenFetched = false;

    /** Public interface of service **/
    return {
        allStudents: function(options) {
            options = _.defaults(options || {}, {refresh: false});

            var deferred = $q.defer();
            // if caller wants refresh, or no sync has ever been performed, fetch now
            if(options.refresh || !beenFetched) {
                _allStudents.fetch({
                    success: function(collection, resp, options) {
                        deferred.resolve(collection);
                        beenFetched = true;
                    },
                    error: function(collection, resp, options) {
                        deferred.reject(resp);
                    }
                });
            }
            else {
                deferred.resolve(_allStudents);
            }

            return deferred.promise;
        }
    };
});
