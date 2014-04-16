angular.module('pace').factory('analyzeDataSources', function($http, $q, apiConfig, Backbone, AttendanceSpan, BehaviorIncident, PointLoss, PeriodicRecord, TreatmentPeriod) {
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

    var LoggableCollection = Backbone.Collection.extend({
        comparator: function(entry) {
            return -moment(entry.getOccurredAt());
        }
    });

    var BehaviorIncidentCollection = LoggableCollection.extend({
        model: BehaviorIncident
    });

    var PeriodicRecordCollection = Backbone.Collection.extend({
        model: PeriodicRecord,
        comparator: 'date'
    });

    var StudentTreatmentPeriodCollection = Backbone.Collection.extend({
        model: TreatmentPeriod,
        comparator: 'date_start',
        initialize: function(models, options) {
            this.student = options.student;
        },
        create: function(attributes) {
            attributes.student = this.student;
            Backbone.Collection.prototype.create.call(this, attributes);
        }
    });

    return {
        /**
         * Returns a promise for a Collection of Attendance objects
         * related to the given student.
         *
         * @param  {Student} student
         * @return {Promise}
         */
        fetchAttendanceLog: function(student) {
            var url = apiConfig.toAPIUrl('students/' + student.id + '/attendancespans/');
            var deferred = $q.defer();
            $http.get(url).then(function(response) {
                deferred.resolve(new AttendanceSpanCollection(response.data, {parse: true}));
            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        },

        /**
         * Returns a promise for a Collection of PointLoss and BehaviorIncident
         * objects related to the given student.
         *
         * @param  {Student} student
         * @return {Promise}
         */
        fetchIncidentLog: function(student) {
            var incidentUrl = apiConfig.toAPIUrl('students/' + student.id + '/behaviorincidents/');
            var pointLossUrl = apiConfig.toAPIUrl('students/' + student.id + '/pointlosses/');

            // currently removing point losses from the incident log

            var fetchingIncidents = $http.get(incidentUrl);
            // var fetchingPointLosses = $http.get(pointLossUrl);
            var fetchingAll = $q.all([
                fetchingIncidents,
                // fetchingPointLosses
            ]);
            var deferred = $q.defer();
            fetchingAll.then(function(responses) {
                var incidents = new (Backbone.Collection.extend({model: BehaviorIncident}))(responses[0].data, {parse: true});
                // var losses = new (Backbone.Collection.extend({model: PointLoss}))(responses[1].data, {parse: true});
                var compositeCollection = new LoggableCollection(incidents.models);
                // compositeCollection.add(losses.models);
                deferred.resolve(compositeCollection);
            }, function(response) {
                deferred.reject(responses);
            });

            return deferred.promise;
        },

        /**
         * Returns a promise for a Collection of just BehaviorIncident
         * objects related to the given student.
         *
         * @param  {Student} student
         * @return {Promise}
         */
        fetchBehaviorIncidentLog: function(student) {
            var url = apiConfig.toAPIUrl('students/' + student.id + '/behaviorincidents/');
            var deferred = $q.defer();
            $http.get(url).then(function(response) {
                deferred.resolve(new BehaviorIncidentCollection(response.data, {parse: true}));
            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        },

        /**
         * Returns a promise for a Collection of PeriodicRecord
         * objects related to the given student.
         *
         * @param  {Student} student
         * @return {Promise}
         */
        fetchPeriodicRecords: function(student) {
            var url = apiConfig.toAPIUrl('students/' + student.id + '/periodicrecords/');
            var deferred = $q.defer();
            $http.get(url).then(function(response) {
                deferred.resolve(new PeriodicRecordCollection(response.data, {parse: true}));
            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        },

        fetchTreatmentPeriods: function(student) {
            var url = apiConfig.toAPIUrl('students/' + student.id + '/treatmentperiods/');
            var deferred = $q.defer();
            $http.get(url).then(function(response) {
                deferred.resolve(new StudentTreatmentPeriodCollection(response.data, {student: student}));
            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        }
    };

});