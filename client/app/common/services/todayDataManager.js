// duties:
//  - get current status of today
//  - start new day
//  - get student data for today
angular.module('pace').factory('todayDataManager', function($http, $q, _, timeTracker, apiConfig, AttendanceSpan, BehaviorIncident, PeriodicRecord) {

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
        fetchTodayRecordForClassroom: function(classroom) {
            var today = timeTracker.getTimestampAsMoment().format('YYYY-MM-DD');
            var url = apiConfig.toAPIUrl('classrooms/' + classroom.id + '/dailyrecords/' + today + '/');

            var fetchingRecord = $q.defer();
            var defaultRecord = new DailyRecord(classroom, today);

            $http.get(url).then(function(response) {
                response.data.classroom = classroom;
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
         * DailyRecord object.
         *
         * @param  {Classroom} classroom
         * @return {Promise}
         */
        initializeDayForClassroom: function(classroom) {
            var today = timeTracker.getTimestampAsMoment().format('YYYY-MM-DD');
            var url = apiConfig.toAPIUrl('classrooms/' + classroom.id + '/dailyrecords/');

            var initializingRecord = $q.defer();
            var newRecord = new DailyRecord(classroom, today);
            newRecord.currentPeriod = 1;

            var postData = _.omit(newRecord, 'classroom');

            $http.post(url, postData).then(
                function(response) {
                    // on success, return our new record (extending just in case, but
                    // response.data should equal request.data on success)
                    response.data.classroom = classroom;
                    initializingRecord.resolve(_.extend(newRecord, response.data));
                },
                function(response) {
                    // if 409 response is returned, server is telling us a record already
                    // exists for the given day. this record data can be found at the url
                    // specified under the 'record_location' key of the result
                    if (response.status === 409) {
                        var recordUrl = response.data['record_location'];
                        $http.get(recordUrl).then(function(response) {
                            response.data.classroom = classroom;
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


        /**
         * Returns promise for updating student data for the given classroom
         * on the current day. Will update the collection of students in a
         * given classroom with `todayPointRecords`, `todayAttendanceSpans`,
         * and `todayBehaviorIncident` collections.
         *
         * Promise resolves with the classroom, rejects with an http response.
         *
         * @param  {DailyRecord} classroom
         * @return {Promise}
         */
        fetchTodayDigestForClassroom: function(classroom) {
            var today = timeTracker.getTimestampAsMoment().format('YYYY-MM-DD');
            var url = apiConfig.toAPIUrl('classrooms/' + classroom.id +
                '/dailyrecords/' + today + '/digest/');

            var fetchingData = $q.defer();

            $http.get(url).then(function(response) {
                if (processDigestData(response.data, classroom)) {
                    fetchingData.resolve(classroom);
                }
                else {
                    fetchingData.reject('error processing');
                }
            }, function(response) {
                fetchingData.reject(response);
            });

            return fetchingData.promise;
        },
    };

    function DailyRecord(classroom, dateString, currentPeriod) {
        this.date = dateString;
        this.classroom = classroom;
        this.currentPeriod = _.isUndefined(currentPeriod) ? null : currentPeriod;
    }

    function DailyData() {
        this.attendanceSpans = new (Backbone.Collection.extend({
            model: AttendanceSpan,
            comparator: function(span) {
                if (span.has('timeIn')) {
                    return -(moment(span.get('date') + 'T' + span.get('timeIn')).toDate());
                }
                else {
                    return -(moment(span.get('date')).toDate());
                }
            }
        }))();

        this.behaviorIncidents = new (Backbone.Collection.extend({
            model: BehaviorIncident,
            comparator: 'startedAt'
        }))();

        this.periodicRecords = new (Backbone.Collection.extend({
            model: PeriodicRecord,
            comparator: 'period'
        }))();
    }

    function processDigestData(apiData, classroom) {
        // update/add any students not currently in the collection
        classroom.set('students', apiData.students, {remove: false, parse: true});

        // cycle through students, reseting todayData
        classroom.get('students').each(function(student) {
            student.set('todayData', new DailyData());
        });

        var students = classroom.get('students');

        // cycle through attendance spans and add to appropriate student's `todayData`
        _.each(apiData.attendanceSpans, function(span) {
            var studentId = span.student;
            var spans = students.get(studentId).get('todayData').attendanceSpans;
            spans.add(span, {parse: true});
        });

        // cycle through incidents and add to appropriate student's `todayData`
        _.each(apiData.behaviorIncidents, function(incident) {
            var studentId = incident.student;
            var incidents = students.get(studentId).get('todayData').behaviorIncidents;
            incidents.add(incident, {parse: true});
        });

        // cycle through periodic records and add to appropriate student's `todayData`
        _.each(apiData.periodicRecords, function(pdRecord) {
            // TODO: remove once `isEligible` is removed from server data model. we only should be
            // handling elgibile records from now on.
            if (pdRecord.isEligible === true) {
                var studentId = pdRecord.student;
                var periodicRecords = students.get(studentId).get('todayData').periodicRecords;
                periodicRecords.add(pdRecord, {parse: true});
            }
        });

        return true;
    }
});