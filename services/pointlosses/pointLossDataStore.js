/**
 * Manages collections of PointLoss resources.
 *
 * Interface:
 * - getTodayPointLossForStudent: Returns a Student-specific collection of
 *     PointLosses for current timeTracker date
 * - createPointLoss: Creates and POSTs a new PointLoss
 */

angular.module('pace').service('pointLossDataStore', function(moment, timeTracker, PointLoss, _) {

    /**
     * Returns a new Collection of PointLosses for today's date.
     *
     * @param  {[Student]} student
     * @return {Collection}
     */
    var todayStudentPointLossFactory = function(student) {
        if (!student || _.isUndefined(student.id)) {
            throw Error("Valid student instance is required.");
        }

        var date = timeTracker.getTimestamp();
        var startDate = moment(date).startOf('day');
        var endDate = moment(date).add(1, 'day').startOf('day');

        // TODO: move this logic up to the server
        var queryString = '?periodic_record__date__gte=' + startDate.format() + '&periodic_record__date__lt=' + endDate.format();

        var url = student.get('pointLossesUrl') + queryString;
        var storeKey = 'PointLosses-' + student.id;

        var today = moment(date).format('YYYY-MM-DD');

        var TodayPointLossCollection = Backbone.Collection.extend({
            model: PointLoss,
            url: url,
        });

        return new TodayPointLossCollection();
    };

    // cache indexed by student id
    var cache = {};

    /**
     * Returns a Collection of PointLosses applicable to the given
     * student for the current date.
     *
     * @param  {Student} student
     * @return {Collection}
     */
    this.getTodayPointLossesForStudent = function(student) {
        var collection = cache[student.id];
        if (!collection) {
            collection = cache[student.id] = todayStudentPointLossFactory(student);
            // TODO: move this outside after card #87 is out there
            collection.fetch();
        }
        return collection;
    };

    /**
     * Function to create an point loss. Also adds point loss to applicable
     * collections managed by this store.
     *
     * @param  {PeriodicRecord} periodicRecord  (or stub with `id`)
     * @param  {String} pointType               (e.g. 'bs')
     * @param  {Date} startedAt
     * @param  {Date} endedAt               (optional if type deosn't require it)
     * @param  {String} comment             (optional)
     *
     * @return {PointLoss}
     */
    this.createPointLoss = function(periodicRecord, pointType, occurredAt, comment) {
        // set arugment defaults
        comment = _.isUndefined(comment) ? "" : comment;

        // mandate that dates are actual Date objects
        occurredAt = moment(occurredAt).toDate();

        var attrs = {
            periodicRecord: periodicRecord,
            pointType: pointType,
            occurredAt: occurredAt,
            comment: comment
        };

        // mixpanel tracking
        mixpanel.track("Point loss");

        // TODO: currently not mandating we'll have a deep PdRecord here
        var student = periodicRecord.get('student');

        // if there's already a collection for the given student, use it to
        // create the new instance
        if (cache[student.id]) {
            return cache[student.id].create(attrs);
        }
        else {
            var newLoss = new PointLoss(attrs);
            newLoss.save();
            return newLoss;
        }
    };
});
