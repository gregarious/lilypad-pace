angular.module('pace').factory('studentDataStore', function(Backbone, Student, timeTracker, $q, apiConfig) {

    function classroomStudentsFactory(classroom) {
        var ClassroomStudentCollection = Backbone.Collection.extend({
            model: Student,

            url: function() {
                // add the query arg to get back active_attendance_span subresources
                var url = 'classrooms/' + classroom.id + '/students/?attendance_anchor=' + timeTracker.getTimestampAsMoment().format();
                return apiConfig.toAPIUrl(url);
            },

            comparator: function(student) {
                var first = student.get('firstName') || '';
                var last = student.get('lastName') || '';
                return (first+last).toLowerCase();
            }
        });

        return new ClassroomStudentCollection();
    }

    var cachedPromises = {};

    /** Public interface of service **/
    return {
        getForClassroom: function(classroom) {
            // if a promise was already made for this classroom, just return it. currently not supporting refresh.
            var oldPromise = cachedPromises[classroom.id];
            if (oldPromise) {
                return oldPromise;
            }

            var deferred = $q.defer();
            var collection = classroomStudentsFactory(classroom);

            collection.fetch({
                success: function(collection) {
                    deferred.resolve(collection);
                },
                error: function(err) {
                    deferred.reject(err);
                }
            });

            cachedPromises[classroom.id] = deferred.promise;
            return deferred.promise;
        }
    };
});

