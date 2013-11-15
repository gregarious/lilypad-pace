angular.module('pace').factory('studentDataStore', function(Backbone, Student, timeTracker, $q, apiConfig) {

    var cachedPromises = {};

    /** Public interface **/
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
                    // fetch active attendance spans before resolving
                    fetchAttendanceSpans(collection).then(
                        function() {
                            deferred.resolve(collection);
                        },
                        function(errs) {
                            deferred.reject('Problem fetching related attendance records');
                        }
                    );
                },
                error: function(err) {
                    deferred.reject(err);
                }
            });

            cachedPromises[classroom.id] = deferred.promise;
            return deferred.promise;
        }
    };

    /** Implementation details **/

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

    /**
     * Fetches any related attendance span records for each student
     *
     * @param  {[type]} studentCollection [description]
     * @param  {[type]} deferred          [description]
     * @return {[type]}                   [description]
     */
    function fetchAttendanceSpans(studentCollection, deferred) {
        allAttendancePromises = [];

        // cycle through each student and fetch their activeAttendanceSpan models
        studentCollection.each(function(student) {
            // this will return 0 or 1 httpPromises, depending on whether student has active span
            var httpPromises = student.fetchRelated('activeAttendanceSpan');
            allAttendancePromises = allAttendancePromises.concat(httpPromises);
        });

        if (allAttendancePromises.length < 1) {
            // if there are no related models to fetch, return an already resolved promise
            var tokenDeferment = $q.defer();
            tokenDeferment.resolve();
            return tokenDeferment.promise;
        }
        else {
            // if some async fetches are being made, make promise for all fetch calls
            return $q.all(allAttendancePromises);
        }
    }
});

