// duties:
//  - get current status of today
//  - start new day
//  - get student data for today
angular.module('pace').service('dailyDataStore', function($http, $q, _, timeTracker, moment, apiConfig, AttendanceSpan, BehaviorIncident, PeriodicRecord) {

    /* Current settings of store. Don't set directly. Use configure() */
    this._settings = {
        date: null,
        classroom: null
    };
    this._data = null;

    this.isSynced = false;
    this.currentPeriod = null;

    this.configure = function(date, classroom) {
        this.clear();   // clear out data, sync status
        this._settings.date = moment(date).format('YYYY-MM-DD');
        this._settings.classroom = classroom;
    };

    this.clear = function() {
        this._settings.date = null;
        this._settings.classroom = null;
        this._data = null;  // clear out data
        this.currentPeriod = null;
        this.isSynced = false;
    };

    /**
     * Returns promise for server fetch. Resolves to store
     * object itself, rejects with error info.
     *
     * After successful fetch, a currentPeriod of null means
     * the day has not begun.
     *
     * @return {Promise}
     */
    this.loadDay = function() {
        if (!this._settings.date || !this._settings.classroom) {
            throw Exception('A date and classroom must be provided for this operation.');
        }
        var url = apiConfig.toAPIUrl('classrooms/' + this._settings.classroom.id +
                                        '/dailyrecords/' + this._settings.date + '/');

        var fetchingData = $q.defer();

        var dataStore = this;
        $http.get(url).then(function(response) {
            dataStore._processResponseData(response.data);
            fetchingData.resolve(dataStore);
        }, function(response, status) {
            if (response.status === 404) {
                dataStore.isSynced = true;
                dataStore.currentPeriod = null;
                fetchingData.resolve(dataStore);
            }
            else {
                dataStore.isSynced = false;
                fetchingData.reject(response, status);
            }
        });

        return fetchingData.promise;
    };

    /**
     * Initialize a new daily record according to the store's current
     * date and classroom settings.
     *
     * Returns promise for server POST operation. Resolves to store
     * object itself, rejects with error info.
     *
     * @return {[type]} [description]
     */
    this.startDay = function() {
        if (!this._settings.date || !this._settings.classroom) {
            throw Exception('A date and classroom must be provided for this operation.');
        }

        var initializingRecord = $q.defer();
        if (this.currentPeriod) {
            initializingRecord.reject('Attempting to start day that has already begun.');
            return initializingRecord.promise;
        }

        var url = apiConfig.toAPIUrl('classrooms/' + this._settings.classroom.id + '/dailyrecords/');

        this.isSynced = false;
        var postData = {
            date: this._settings.date,
            currentPeriod: 1
        };

        var dataStore = this;
        $http.post(url, postData).then(
            function(response) {
                // on success, process the data (though the response in this case should
                // always include just a currentPeriod set to 1 and no date, since the
                // 409-status handler below will take control if data already existed on
                // the server.
                dataStore._processResponseData(response.data);
                initializingRecord.resolve(dataStore);
            },
            function(response) {
                // if 409 response is returned, server is telling us a record already
                // exists for the given day. this record data can be found at the url
                // specified under the 'record_location' key of the result
                if (response.status === 409) {
                    var recordUrl = response.data['record_location'];
                    $http.get(recordUrl).then(function(response) {
                        dataStore._processResponseData(response.data);
                        initializingRecord.resolve(dataStore);
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
    };

    this._processResponseData = function(data) {
        // debugger;
        this.currentPeriod = data.currentPeriod;
        // TODO: complete data processing
    };

    // function DailyData() {
    //     this.attendanceSpans = new (Backbone.Collection.extend({
    //         model: AttendanceSpan,
    //         comparator: function(span) {
    //             if (span.has('timeIn')) {
    //                 return -(moment(span.get('date') + 'T' + span.get('timeIn')).toDate());
    //             }
    //             else {
    //                 return -(moment(span.get('date')).toDate());
    //             }
    //         }
    //     }))();

    //     this.behaviorIncidents = new (Backbone.Collection.extend({
    //         model: BehaviorIncident,
    //         comparator: 'startedAt'
    //     }))();

    //     this.periodicRecords = new (Backbone.Collection.extend({
    //         model: PeriodicRecord,
    //         comparator: 'period'
    //     }))();
    // }

    // function processDigestData(apiData, classroom) {
    //     // update/add any students not currently in the collection
    //     classroom.set('students', apiData.students, {remove: false, parse: true});

    //     // cycle through students, reseting todayData
    //     classroom.get('students').each(function(student) {
    //         student.set('todayData', new DailyData());
    //     });

    //     var students = classroom.get('students');

    //     // cycle through attendance spans and add to appropriate student's `todayData`
    //     _.each(apiData.attendanceSpans, function(span) {
    //         var studentId = span.student;
    //         var spans = students.get(studentId).get('todayData').attendanceSpans;
    //         spans.add(span, {parse: true});
    //     });

    //     // cycle through incidents and add to appropriate student's `todayData`
    //     _.each(apiData.behaviorIncidents, function(incident) {
    //         var studentId = incident.student;
    //         var incidents = students.get(studentId).get('todayData').behaviorIncidents;
    //         incidents.add(incident, {parse: true});
    //     });

    //     // cycle through periodic records and add to appropriate student's `todayData`
    //     _.each(apiData.periodicRecords, function(pdRecord) {
    //         // TODO: remove once `isEligible` is removed from server data model. we only should be
    //         // handling elgibile records from now on.
    //         if (pdRecord.isEligible === true) {
    //             var studentId = pdRecord.student;
    //             var periodicRecords = students.get(studentId).get('todayData').periodicRecords;
    //             periodicRecords.add(pdRecord, {parse: true});
    //         }
    //     });

    //     return true;
    // }
});