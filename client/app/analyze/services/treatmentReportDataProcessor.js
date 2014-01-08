angular.module('pace').factory('TreatmentReportDataProcessor', function($q, timeTracker, RulePointsProcessor, analyzeDataSources, _) {

    /**
     * Constructor for an object that will fetch and process data relevant to a
     * student's treatment report.
     *
     * @param  {Student} student
     * @param  {Date} startDate
     * @param  {Date} endDate
     * @return {TreatmentReportDataProcessor}
     */
    return function(student, startDate, endDate) {
        this.getStartDate = function() {
            return startDate;
        };

        this.getEndDate = function() {
            return endDate;
        };

      /**
       * Returns a promise that is resolved when all data has been
       * fetched from the server. Nothing is resolved with the promise,
       * it just signifies that the internal state of this object is
       * synced with the server.
       *
       * @return {Promise}
       */
      this.fetchData = function() {
        // Fetch relevant data for the student in the given time span
        // TODO: add date filtering
        var fetchingPeriodicRecords = analyzeDataSources.fetchPeriodicRecords(student);
        var fetchingBehaviorIncidents = analyzeDataSources.fetchBehaviorIncidentLog(student);
        var fetchingAll = $q.all([fetchingPeriodicRecords, fetchingBehaviorIncidents]);

        // when all data is retreived, resolve the promise
        var deferred = $q.defer();
        fetchingAll.then(function(collections) {
          this.periodicRecords = collections[0];
          this.incidents = collections[1];
          deferred.resolve();
        }, function(response) {
          deferred.reject();
        });

        return deferred.promise;
      };

      this.getRulesData = function() {
        var _rulePointsProcessor = new RulePointsProcessor(this.periodicRecords);
        return pointsProcessor.getSummaryData();
      };
    };
});
