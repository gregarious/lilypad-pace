angular.module('pace').factory('studentDataStore', function(Backbone, Student, timeTracker, $q, apiConfig) {

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
                    // fetch active attendance spans before resolving
                    fetchAttendanceSpans(collection, deferred);
                },
                error: function(err) {
                    deferred.reject(err);
                }
            });

            cachedPromises[classroom.id] = deferred.promise;
            return deferred.promise;
        }
    };

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

        // if there are related models to fetch, resolve the main deferred object immediately
        if (allAttendancePromises.length < 1) {
            deferred.resolve(studentCollection);
        }
        else {
            // if some async fetches are being made, only resolve the main deferred object
            // when they are resolved successfully
            var fetchingAttendance = $q.all(allAttendancePromises);
            fetchingAttendance.then(function() {
                deferred.resolve(studentCollection);
            },
            function(errs) {
                deferred.reject('Problem fetching related attendance records');
            });
        }
    }
});

