/**
 * Manages collections of BehaviorIncidents.
 *
 * Interface:
 * - getTodayIncidentsForStudent: Returns a Student-specific collection of
 *     BehaviorIncidents for current timeTracker date
 * - createIncident: Creates and POSTs a new incident
 */

angular.module('pace').service('behaviorIncidentDataStore', function(moment, timeTracker, BehaviorIncident, _, $q) {

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

        var today = moment(date).format('YYYY-MM-DD');

        var TodayIncidentCollection = Backbone.Collection.extend({
            model: BehaviorIncident,
            url: url
        });

        return new TodayIncidentCollection();
    };

    // cache indexed by student id
    var cache = {};
    var cachedPromises = {};

    /**
     * Returns a promise for a Collection of BehaviorIncidents applicable
     * to the given student for the current date.
     *
     * @param  {Student} student
     * @return {Collection}
     */
    this.getTodayIncidentsForStudent = function(student) {
        // if a promise was already made for this student, just return it. currently not supporting refresh.
        var oldPromise = cachedPromises[student.id];
        if (oldPromise) {
            return oldPromise;
        }

        var collection = cache[student.id] = todayStudentIncidentFactory(student);
        var deferred = $q.defer();

        collection.fetch({
            success: function(collection) {
                // fetch active attendance spans before resolving
                fetchIncidentTypes(collection).then(
                    function() {
                        deferred.resolve(collection);
                    },
                    function(errs) {
                        deferred.reject('Problem fetching related incident types');
                    }
                );

                deferred.resolve(collection);
            },
            error: function(err) {
                deferred.reject(err);
            }
        });

        cachedPromises[student.id] = deferred.promise;
        return deferred.promise;
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

    /**
     * Fetch related incident types for all incidents and returns promise that will
     * be resolved when all are fetched.
     */
    function fetchIncidentTypes(incidentCollection) {
        allRelatedPromises = [];

        // cycle through each student and fetch their activeAttendanceSpan models
        incidentCollection.each(function(incident) {
            // this will return 0 or 1 httpPromises, depending on whether student has active span
            var httpPromises = incident.fetchRelated('type');
            allRelatedPromises = allRelatedPromises.concat(httpPromises);
        });

        if (allRelatedPromises.length < 1) {
            // if there are no related models to fetch, return an already resolved promise
            var tokenDeferment = $q.defer();
            tokenDeferment.resolve();
            return tokenDeferment.promise;
        }
        else {
            // if some async fetches are being made, make promise for all fetch calls
            return $q.all(allRelatedPromises);
        }
    }
});
