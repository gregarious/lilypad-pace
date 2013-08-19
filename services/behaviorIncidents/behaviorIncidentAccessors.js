angular.module('pace').factory('behaviorIncidentAccessors', function(_, Backbone, moment, Student, StudentBehaviorTypeCollection, BehaviorIncident, $q) {

    // internal StudentBehaviorTypeCollection cache
    var behaviorTypesStore = {};

    var exports = {};
    /**
     * Returns a StudentBehaviorTypeCollection with models for the
     * given student.
     *
     * @param  {Student} student
     * @param  {String} options       if {refresh: true} in options, a fetch
     *                                will be performed when the collection
     *                                already exists.
     *
     * @return {StudentBehaviorTypeCollection}
     */
    var studentBehaviorTypes = function(student, options) {
        var refresh = options && options.refresh;
        if (!behaviorTypesStore[student.id]) {
            behaviorTypesStore[student.id] = new StudentBehaviorTypeCollection([], {
                student: student
            });
            refresh = true;
        }

        var deferred = $q.defer();
        if (refresh) {
            // TODO: revisit the non-destructive nature of the fetch
            behaviorTypesStore[student.id].fetch({
                remove: false,
                success: function(collection, resp, options) {
                    deferred.resolve(collection);
                },
                error: function(collection, resp, options) {
                    deferred.resolve(resp);
                }
            });
        }
        else {
            deferred.resolve(behaviorTypesStore[student.id]);
        }

        return deferred.promise;
    };

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
    var createIncident = function(student, type, startedAt, endedAt, comment) {
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
    };

    return {
        studentBehaviorTypes: studentBehaviorTypes,
        createIncident: createIncident
    };
});
