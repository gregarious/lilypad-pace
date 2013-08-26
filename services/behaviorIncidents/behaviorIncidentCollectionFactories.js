/**
 * Provides factories to create new Collections for models related to
 * BehaviorIncidents. At the moment, this is only for BehaviorIncidentTypes,
 * collections for incidents themselves are part of
 * loggableCollectionFactories.
 *
 * studentTypes: Returns a new Collection of student-specific
 *                 BehaviorIncidentTypes
 */

angular.module('pace').factory('behaviorIncidentCollectionFactories', function(APIBackedCollection, BehaviorIncidentType) {
    return {
        /**
         * Returns a new Collection of BehaviorIncidentType for a given
         * student.
         *
         * @param  {Student} student    (must have `behaviorTypesUrl` defined)
         * @return {Collection}
         */
        studentTypes: function(student) {
            var BehaviorTypeCollection = APIBackedCollection.extend({
                model: BehaviorIncidentType,
                url: student.get('behaviorTypesUrl'),

                /**
                 * Creates a custom new incident type for a student.
                 * @param  {String} label
                 * @param  {String} supportsDuration (default: false)
                 * @param  {String} code             (optional)
                 * @return {BehaviorIncidentType}
                 */
                createIncidentType: function(label, supportsDuration, code, options) {
                    return this.create({
                        label: label,
                        supportsDuration: supportsDuration,
                        code: code || '',
                        applicableStudent: this._student
                    }, options);
                }
            });

            return new BehaviorTypeCollection();
        }
    };
});
