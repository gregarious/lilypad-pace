/**
 * Manages collections of BehaviorIncident/BehaviorIncidentsTypes.
 *
 * Interface:
 * - getDailyIncidentsForStudent: Returns a Student-specific collection of
 *     BehaviorIncidents for current timeTracker date
 * - getIncidentsForStudent: Returns a Student-specific collection of BehaviorIncidents
 * - getTypesForStudent: Returns a Student-specific collection of BehaviorIncidentTypes
 * - createIncident: Creates and POSTs a new incident
 */

angular.module('pace').factory('behaviorIncidentDataStore', function(moment, timeTracker, behaviorIncidentCollectionFactories) {
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
        getDailyIncidentsForStudent: function(student) {
            var today = timeTracker.getTimestampAsMoment().format('YYYY-MM-DD');
            var collection = behaviorIncidentCollectionFactories.dailyStudentIncidents(student, today);
            collection.fetch();
            return collection;
        },
    };
});
