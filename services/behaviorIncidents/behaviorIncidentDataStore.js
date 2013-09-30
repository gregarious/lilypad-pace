/**
 * Manages collections of BehaviorIncident/BehaviorIncidentsTypes.
 *
 * Interface:
 * - getIncidentsForStudentToday: Returns a Student-specific collection of
 *     BehaviorIncidents for current timeTracker date
 * - getTypesForStudent: Returns a Student-specific collection of BehaviorIncidentTypes
 * - createIncident: Creates and POSTs a new incident
 */

angular.module('pace').factory('behaviorIncidentDataStore', function(moment, timeTracker, BehaviorIncident, behaviorIncidentCollectionFactories) {
    // cache indexed by student id
    var todayIncidentCollections = {};

    return {
        /**
         * Returns a Collection of BehaviorIncidentTypes applicable
         * to the given student. This includes both custom types only defined
         * for the student, as well as types common across all students.
         *
         * @param  {Student} student
         * @return {Collection}
         */
        getTypesForStudent: function(student) {
            var collection = behaviorIncidentCollectionFactories.studentTypes(student);
            collection.fetch();
            return collection;
        },

        /**
         * Returns a Collection of BehaviorIncidents applicable to the given
         * student for the current date.
         *
         * @param  {Student} student
         * @return {Collection}
         */
        getIncidentsForStudentToday: function(student) {
            var collection = todayIncidentCollections[student.id];
            if (!collection) {
                var factory = behaviorIncidentCollectionFactories.studentIncidentsForToday;
                collection = todayIncidentCollections[student.id] = factory(student);
            }
            // TODO: fix pending POST/removal issue
            collection.fetch({remove: false});
            return collection;
        },

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
        createIncident: function(student, type, startedAt, endedAt, comment) {
            // set arugment defaults
            endedAt = _.isUndefined(endedAt) ? null : endedAt;
            comment = _.isUndefined(comment) ? "" : comment;

            // mandate that dates are actual Date objects
            startedAt = moment(startedAt).toDate();
            endedAt = endedAt ? moment(endedAt).toDate() : null;

            var newIncident = new BehaviorIncident({
                student: student,
                type: type,
                startedAt: startedAt,
                endedAt: endedAt,
                comment: comment
            });

            // before returning, check to see if the new incident should go into any
            // of the collections the store tracks
            var studentCollection = todayIncidentCollections[student.id];
            if (studentCollection) {
                var dateOccurred = moment(startedAt).format('YYYY-MM-DD');
                var dateForCollection = moment(studentCollection.date).format('YYYY-MM-DD');
                if (dateOccurred === dateForCollection) {
                    studentCollection.add(newIncident);
                }
            }

            return newIncident;
        }
    };
});
