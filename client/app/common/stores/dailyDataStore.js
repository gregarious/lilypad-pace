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
    this.studentData = {};
    this.hasDayBegun = false;

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
        this.studentData = {};
        this.hasDayBegun = false;
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
            dataStore.isSynced = true;
            dataStore.hasDayBegun = true;
            dataStore._processResponseData(response.data);
            fetchingData.resolve(dataStore);
        }, function(response, status) {
            if (response.status === 404) {
                dataStore.isSynced = true;
                dataStore.currentPeriod = null;
                dataStore.hasDayBegun = false;
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
                dataStore.hasDayBegun = true;
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
                        dataStore.hasDayBegun = true;
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
        var classroom = this._settings.classroom;

        // first, set the current period
        this.currentPeriod = data.currentPeriod;

        // update/add any students not currently in the collection
        classroom.set('students', data.students, {remove: false, parse: true});

        // now process all the student data
        var studentData = {};

        // set up student-specific data buckets
        var students = classroom.get('students');
        var studentRawDataMap = {};
        students.each(function(student) {
            studentRawDataMap[student.id] = {
                attendanceSpans: [],
                behaviorIncidents: [],
                periodicRecords: []
            };
        });

        // filter data into buckets
        _.each(['attendanceSpans', 'behaviorIncidents', 'periodicRecords'], function(dataType) {
            _.each(data[dataType], function(item) {
                var studentId = item.student;
                studentRawDataMap[studentId][dataType].push(item);
            });
        });

        // finally build a DailyData object for each student
        students.each(function(student) {
            studentData[student.id] = new DailyData(studentRawDataMap[student.id]);
        });

        this.studentData = studentData;
        return true;
    };

    // Collections used by DailyData
    var BehaviorIncidentCollection = Backbone.Collection.extend({
        model: BehaviorIncident,
        comparator: 'startedAt'
    });
    var PeriodicRecordCollection = Backbone.Collection.extend({
        model: PeriodicRecord,
        comparator: 'period'
    });

    function DailyData(data) {
        var allSpans = _.sortBy(data.attendanceSpans, function(span) {
            if (span.timeIn) {
                return -(moment(span.date + 'T' + span.timeIn));
            }
            else {
                throw Exception("Cannot sort an AttendanceSpan with no `timeIn`");
            }
        });

        if (allSpans.length > 0) {
            this.activeAttendanceSpan = allSpans[0];
        }
        else {
            this.activeAttendanceSpan = null;
        }

        this.behaviorIncidents = new BehaviorIncidentCollection(data.behaviorIncidents,
            {parse: true});

        // filter out records with falsy `isEligible`
        // TODO: this attribute should be removed from server data model. since refactor,
        // records should only be created if student is eligible in the given period
        data.periodicRecords = _.filter(data.periodicRecords, function(pdRecord) {
            return pdRecord.isEligible === true;
        });

        this.periodicRecords = new PeriodicRecordCollection(data.periodicRecords,
            {parse: true});
    }
});
