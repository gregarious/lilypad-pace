/**
 * Provides factories to create new Collections of PeriodicRecord objects
 */
angular.module('pace').factory('periodicRecordCollectionFactories', function(APIBackedCollection, PeriodicRecord) {
    return {
        /**
         * Returns a new Collection of PeriodicRecords for a given student
         * in a given date range.
         *
         * @param  {Student} student    (must have `behaviorIncidentsUrl` and
         *                              `pointLossesUrl` attributes defined)
         * @param  {String} date        (ISO-formatted date)
         * @return {Collection instance}
         */
        dailyStudentRecords: function(student, date) {
            var PeriodicRecordCollection = APIBackedCollection.extend({
                model: PeriodicRecord,

                url: student.get('periodicRecordsUrl') + '?date=' + date,

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

            return new PeriodicRecordCollection();
        }
    };
});
