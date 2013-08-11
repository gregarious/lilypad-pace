angular.module('pace').factory('DailyStudentRecordCollection', function(Backbone, PeriodicRecord) {
    return Backbone.Collection.extend({
        model: PeriodicRecord,

        /**
         * Collection must be initialized with an options dict that
         * includes `student` and `dateString`.
         */
        initialize: function(models, options) {
			options = options || {};
			if (_.isUndefined(options.student) || _.isUndefined(options.dateString)) {
                throw new Error("Constructor must be called with `student` and `dateString` in options hash");
			}
            this._student = options.student;
            this._dateString = options.dateString;
        },

        url: function() {
            return this._student.get('periodicRecordsUrl') + '?date=' + this._dateString;
        },

        /**
         * Return the PeriodicRecord model corresponding
         * to the given period number.
         * 
         * @param  {Integer} period
         * @return {PeriodicRecord or undefined}
         */
        getPeriodicRecord: function(period) {
            return this.findWhere({period: period});
        },

        /**
         * Wrapper around Collection.create that inserts student and date into
         * attributes for new Model. Don't use create directly.
         * @param  {Integer}  period           
         * @param  {Boolean}  isEligible         (default true)
         * @param  {Integer}  initialPointValue  (default 2 if eligible, null if not)
         * @param  {Object} options              Typical Backbone.create options
         * @return {PeriodicRecord}
         */
        createPeriodicRecord: function(period, isEligible, initialPointValue, options) {
            isEligible = !_.isUndefined(isEligible) ? isEligible : true;
            initialPointValue = initialPointValue || (isEligible ? 2 : null);
            return this.create({
                student: this._student,
                date: this._dateString,
                period: period,
                isEligible: isEligible,
                points: {
                    kw: initialPointValue,
                    cw: initialPointValue,
                    fd: initialPointValue,
                    bs: initialPointValue
                }
            }, options);
        }
    });
});
