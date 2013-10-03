/**
 * Manages collections of PeriodicRecords for the current date (according
 * to timeTracker).
 *
 * Interface:
 * - getTodayRecordsForStudent: Returns a Student-specific collection of
 *     PeriodicRecords applicable to the current date
 */

angular.module('pace').service('periodicRecordDataStore', function(_, timeTracker, PeriodicRecord) {

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
        var storeKey = 'PeriodicRecord-' + student.id;

        var TodayPeriodicRecordCollection = Backbone.Collection.extend({
            model: PeriodicRecord,
            dataStore: new Backbone.PersistentStore(PeriodicRecord, storeKey),

            url: student.get('periodicRecordsUrl') + '?date=' + today,
            storeFilter: function(model) {
                return model.get('date') === today;
            },

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

    this.getTodayRecordsForStudent = function(student) {
        var collection = cache[student.id];
        if (!collection) {
            collection = cache[student.id] = todayStudentRecordFactory(student);
            // TODO: move this outside after card #87 is out there
            collection.fetch();
        }
        return collection;
    };

    this.getById = function(id) {
        for (var key in cache) {
            var collection = cache[key];
            var record = collection.get(id);
            return record;
        }
        return null;
    };
});
