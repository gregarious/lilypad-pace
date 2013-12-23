// duties:
//  - get current status of today
//  - start new day
//  - get student data for today
angular.module('pace').factory('todayDataManager', function($http, $q, timeTracker, apiConfig) {
    var DailyRecord = function(dateString, classroom) {
        this.date = dateString;
        this.currentPeriod = null;
    };

    return {
        /**
         * Returns promise for DailyRecord object for classroom,
         * with currentPeriod set to null if class does not have a
         * daily record yet.
         *
         * @param  {Classroom} classroom
         *
         * @return {Promise}
         */
        todayRecordForClassroom: function(classroom) {
            var today = timeTracker.getTimestampAsMoment().format('YYYY-MM-DD');
            var url = apiConfig.toAPIUrl('classrooms/' + classroom.id + '/dailyrecords/' + today + '/');

            var fetchingRecord = $q.defer();
            var defaultRecord = new DailyRecord(today, classroom);

            $http.get(url).then(function(response) {
                fetchingRecord.resolve(_.extend(defaultRecord, response.data));
            }, function(response) {
                if (response.status === 404) {
                    fetchingRecord.resolve(defaultRecord);
                }
                else {
                    fetchingRecord.reject(response);
                }
            });

            return fetchingRecord.promise;
        },

        /**
         * Initializes a new DailyRecord object for the classroom and
         * pushes it to the server. Returns a promise for the new
         * object.
         *
         * @param  {Classroom} classroom
         * @return {Promise}
         */
        initializeDayForClassroom: function(classroom) {
            var today = timeTracker.getTimestampAsMoment().format('YYYY-MM-DD');
            var url = apiConfig.toAPIUrl('classrooms/' + classroom.id + '/dailyrecords/');

            var initializingRecord = $q.defer();
            var newRecord = new DailyRecord(today, classroom);
            newRecord.currentPeriod = 1;

            var postData = _.omit(newRecord, 'classroom');

            $http.post(url, postData).then(
                function(response) {
                    // on success, return our new record (extending just in case, but
                    // response.data should equal request.data on success)
                    initializingRecord.resolve(_.extend(newRecord, response.data));
                },
                function(response) {
                    // if 409 response is returned, server is telling us a record already
                    // exists for the given day. this record data can be found at the url
                    // specified under the 'record_location' key of the result
                    if (response.status === 409) {
                        var recordUrl = response.data['record_location'];
                        $http.get(recordUrl).then(function(response) {
                            initializingRecord.resolve(_.extend(newRecord, response.data));
                        }, function(response) {
                            // don't gracefully handle 404s this time. something is wrong server-side
                            // if we get a 404 at this point.
                            initializingRecord.reject(response);
                        });
                    }
                    else {
                        initializingRecord.reject(response);
                    }
                }
            );

            return initializingRecord.promise;
        },


    };
});