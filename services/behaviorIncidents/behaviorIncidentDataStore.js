/**
 * Manages collections of BehaviorIncident/BehaviorIncidentsTypes.
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of BehaviorIncidentTypes
 * - createIncident: Creates and POSTs a new incident
 * - createIncidentTypeForStudent: Creates and POSTs a new incident
 */

angular.module('pace').factory('behaviorIncidentDataStore', function(moment, BehaviorIncident, behaviorIncidentCollectionFactories) {
    // BehaviorIncidentType cache, indexed by student
    var cache = {};

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
            var collection = cache[student.id];
            if (!collection) {
                var factory = behaviorIncidentCollectionFactories.studentTypes;
                collection = cache[student.id] = factory(student);
                collection.fetch();
            }
            return collection;
        },

        /**
         * Wrapper around BehaviorIncident model creation and saving.
         *
         * @param  {Student} student
         * @param  {BehaviorIncidentType} type
         * @param  {Date} startedAt
         * @param  {Date or null} endedAt
         * @param  {String} comment
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
            newIncident.save();

            return newIncident;
        }
    };
});
