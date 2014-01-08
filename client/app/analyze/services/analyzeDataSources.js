angular.module('pace').factory('analyzeDataSources', function($http, apiConfig) {
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
            return $http.get(url);
        }
    };

});