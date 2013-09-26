/**
 * Provides factories to create new Collections for models related to
 * BehaviorIncidents. At the moment, this is only for BehaviorIncidentTypes,
 * collections for incidents themselves are part of
 * loggableCollectionFactories.
 *
 * studentTypes: Returns a new Collection of student-specific
 *                 BehaviorIncidentTypes
 */

angular.module('pace').factory('behaviorIncidentCollectionFactories', function(BehaviorIncidentType, BehaviorIncident) {
    return {
        /**
         * Returns a new Collection of BehaviorIncidentType for a given
         * student.
         *
         * @param  {Student} student    (must have `behaviorTypesUrl` defined)
         * @return {Collection}
         */
        studentTypes: function(student) {
            if (student.id === void 0) {
                throw Error("Valid student instance is required.");
            }

            var BehaviorTypeCollection = Backbone.PersistentCollection.extend({
                model: BehaviorIncidentType,
                url: student.get('behaviorTypesUrl'),
                localStorage: new Backbone.LocalStorage("BehaviorTypes-" + student.id),

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
                        applicableStudent: {id: student}        // TODO: shouldn't have to mandate this here
                    }, options);
                }
            });

            return new BehaviorTypeCollection();
        },

        /**
         * Returns a new Collection of BehaviorIncidents for a given student
         * and date.
         *
         * @param  {[type]} student Student
         * @param  {[type]} date    String (ISO-formatted)
         * @return {Collection}
         */
        dailyStudentIncidents: function(student, date) {
            if (student.id === void 0 || !date) {
                throw Error("Valid student instance and date string are required.");
            }

            var startDate = moment(date).startOf('day').format();
            var endDate = moment(date).add(1, 'day').startOf('day').format();
            var queryString = '?started_at__gte=' + startDate + '&started_at__lt=' + endDate;

            var url = student.get('behaviorIncidentsUrl') + queryString;
            var localStorageKey = 'BehaviorIncidents-' + student.id + '-' + date;

            var DailyIncidentCollection = Backbone.PersistentCollection.extend({
                model: BehaviorIncident,
                dateString: date,
                url: url,

                localStorage: new Backbone.LocalStorage(localStorageKey),

                createIncident: function(student, type, startedAt, endedAt, comment) {
                    // set arugment defaults
                    endedAt = _.isUndefined(endedAt) ? null : endedAt;
                    comment = _.isUndefined(comment) ? "" : comment;

                    // mandate that dates are actual Date objects
                    startedAt = moment(startedAt).toDate();
                    endedAt = endedAt ? moment(endedAt).toDate() : null;

                    return this.create({
                        student: student,
                        type: type,
                        startedAt: startedAt,
                        endedAt: endedAt,
                        comment: comment
                    });
                }
            });

            return new DailyIncidentCollection();
        }
    };
});
