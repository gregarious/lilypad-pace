/**
 * Manages collections of BehaviorIncident/BehaviorIncidentsTypes.
 *
 * Interface:
 * - getTodayIncidentsForStudent: Returns a Student-specific collection of
 *     BehaviorIncidents for current timeTracker date
 * - getTypesForStudent: Returns a Student-specific collection of BehaviorIncidentTypes
 * - createIncident: Creates and POSTs a new incident
 */

angular.module('pace').service('behaviorIncidentDataStore', function(moment, timeTracker, BehaviorIncident, _) {

    /**
     * Returns a new Collection of BehaviorIncidents for today's date.
     *
     * @param  {[Student]} student
     * @return {Collection}
     */
    var todayStudentIncidentFactory = function(student) {
        if (!student || _.isUndefined(student.id)) {
            throw Error("Valid student instance is required.");
        }

        var date = timeTracker.getTimestamp();
        var startDate = moment(date).startOf('day');
        var endDate = moment(date).add(1, 'day').startOf('day');

        var queryString = '?started_at__gte=' + startDate.format() + '&started_at__lt=' + endDate.format();

        var url = student.get('behaviorIncidentsUrl') + queryString;
        var storeKey = 'BehaviorIncidents-' + student.id;

        var TodayIncidentCollection = Backbone.Collection.extend({
            model: BehaviorIncident,
            url: url,

            dataStore: new Backbone.PersistentStore(BehaviorIncident, storeKey),
            storeFilter: function(incident) {
                var startedAt = incident.get('startedAt');
                return startedAt >= startDate && startedAt < endDate;
            }
        });

        return new TodayIncidentCollection();
    };

    // cache indexed by student id
    var cache = _g = {};

    /**
     * Returns a Collection of BehaviorIncidents applicable to the given
     * student for the current date.
     *
     * @param  {Student} student
     * @return {Collection}
     */
    this.getTodayIncidentsForStudent = function(student) {
        var collection = cache[student.id];
        if (!collection) {
            collection = cache[student.id] = todayStudentIncidentFactory(student);
        }
        collection.fetch();
        return collection;
    };

    /**
     * Function to create an incident. Also adds incident to applicable
     * collections managed by this store.
     *
     * @param  {Student} student            (or stub with `id`)
     * @param  {BehaviorIncidentType} type  (or stub with `id` & `label`)
     * @param  {Date} startedAt
     * @param  {Date} endedAt               (optional if type deosn't require it)
     * @param  {String} comment             (optional)
     *
     * @return {BehaviorIncident}
     */
    this.createIncident = function(student, type, startedAt, endedAt, comment) {
        // set arugment defaults
        endedAt = _.isUndefined(endedAt) ? null : endedAt;
        comment = _.isUndefined(comment) ? "" : comment;

        // mandate that dates are actual Date objects
        startedAt = moment(startedAt).toDate();
        endedAt = endedAt ? moment(endedAt).toDate() : null;

        var attrs = {
            student: student,
            type: type,
            startedAt: startedAt,
            endedAt: endedAt,
            comment: comment
        };

        // if there's already a collection for the given student, use it to
        // create the new instance
        if (cache[student.id]) {
            return cache[student.id].create(attrs);
        }
        else {
            var newIncident = new BehaviorIncident(attrs);
            newIncident.save();
            return newIncident;
        }
    };
});
