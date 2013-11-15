/**
 * Manages collections of PeriodicRecords for the current date (according
 * to timeTracker).
 *
 * Interface:
 * - getTodayRecordsForStudent: Returns a Student-specific collection of
 *     PeriodicRecords applicable to the current date
 */

angular.module('pace').service('periodicRecordDataStore', function(_, timeTracker, PeriodicRecord, $q) {

    /**
     * Factory to return a new Collection of PeriodicRecords for a
     * given student on today's date.
     *
     * @param  {Student} student    (must have `behaviorIncidentsUrl` and
     *                              `pointLossesUrl` attributes defined)
     * @param  {String} date        (ISO-formatted date)
     * @return {Collection instance}
     */
    var todayStudentRecordFactory = function(student) {
        if (!student || _.isUndefined(student.id)) {
            throw Error("Valid student instance is required.");
        }

        var today = timeTracker.getTimestampAsMoment().format('YYYY-MM-DD');

        var TodayPeriodicRecordCollection = Backbone.Collection.extend({
            model: PeriodicRecord,

            url: student.get('periodicRecordsUrl') + '?date=' + today,

            comparator: 'period',

            /**
             * Return the PeriodicRecord model corresponding
             * to the given period number.
             *
             * @param  {Integer} period     (optional) If omitted, returns record
             *                              for highest-number period
             * @return {PeriodicRecord or undefined}
             */
            getByPeriod: function(period) {
                if (_.isUndefined(period)) {
                    period = _.max(this.pluck('period'));
                }
                return this.findWhere({period: period});
            },

            getAvailablePeriods: function() {
                return this.pluck('period');
            }
        });

        return new TodayPeriodicRecordCollection();
    };

    var cache = {};
    var cachedPromises = {};

    this.getTodayRecordsForStudent = function(student, success, error) {
        // if a promise was already made for this student, just return it. currently not supporting refresh.
        var oldPromise = cachedPromises[student.id];
        if (oldPromise) {
            return oldPromise;
        }

        var collection = cache[student.id] = todayStudentRecordFactory(student);
        var deferred = $q.defer();

        collection.fetch({
            success: function(collection) {
                _g = collection;
                deferred.resolve(collection);
            },
            error: function(err) {
                deferred.reject(err);
            }
        });

        cachedPromises[student.id] = deferred.promise;
        return deferred.promise;
    };
});
