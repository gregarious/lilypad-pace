angular.module('pace').factory('analyzeDataSources', function($http, $q, apiConfig, Backbone, AttendanceSpan) {
    var AttendanceSpanCollection = Backbone.Collection.extend({
        model: AttendanceSpan,
        comparator: function(span) {
            if (span.has('timeIn')) {
                return -(moment(span.get('date') + 'T' + span.get('timeIn')).toDate());
            }
            else {
                return -(moment(span.get('date')).toDate());
            }
        }
    });

    return {
        /**
         * Returns a promise for an array of Attendance objects
         * related to the given student.
         *
         * @param  {Student} student
         * @return {Promise}
         */
        fetchAttendanceLog: function(student) {
            var url = apiConfig.toAPIUrl('students/' + student.id + '/attendancespans/');
            var deferred = $q.defer();
            $http.get(url).then(function(response) {
                deferred.resolve(new AttendanceSpanCollection(response.data));
            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        }
    };

});