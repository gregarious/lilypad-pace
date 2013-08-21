angular.module('pace').factory('periodicRecordCollectionFactory', function(APIBackedCollection, PeriodicRecord) {
    /**
     * Returns a new Collection of Loggable models for a given student
     * in a given date range.
     *
     * @param  {Student} student    (must have `behaviorIncidentsUrl` and
     *                              `pointLossesUrl` attributes defined)
     * @param  {String} date        (ISO-formatted date)
     * @return {Collection instance}
     */
    return function(student, date) {
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
            getPeriodicRecord: function(period) {
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
    };
});
