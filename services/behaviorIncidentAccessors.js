angular.module('pace').factory('behaviorIncidentAccessors', function(Backbone, moment, Student, StudentBehaviorTypeCollection, DailyStudentIncidentCollection) {

    // internal StudentBehaviorTypeCollection cache
    var behaviorTypesStore = {};

    // internal DailyStudentIncidentCollection cache
    var dailyIncidentsStore = {};

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
    exports.studentBehaviorTypes = function(student, options) {
        var refresh = options && options.refresh;
        if (!behaviorTypesStore[student.id]) {
            behaviorTypesStore[student.id] = new StudentBehaviorTypeCollection([], {
                student: student
            });
            refresh = true;
        }
        if (refresh) {
            // TODO: revisit the non-destructive nature of the fetch
            behaviorTypesStore[student.id].fetch({remove: false});
        }
        return behaviorTypesStore[student.id];
    };

    /**
     * Returns a DailyStudentIncidentCollection with incidents for the 
     * given student and date.
     * 
     * @param  {Student} student
     * @param  {String} dateString    default: today's date as ISO string
     * @param  {String} options       if {refresh: true} in options, a fetch
     *                                will be performed when the collection
     *                                already exists.
     * @return {DailyStudentIncidentCollection}
     */

    exports.dailyStudentIncidents = function(student, dateString, options) {
        // use today's day if no date was provided
        dateString = dateString || moment().format('YYYY-MM-DD');
        var refresh = options && options.refresh;

        var cacheKey = student.id + '/' + dateString;

        var incidentCollection = dailyIncidentsStore[cacheKey];
        if (!incidentCollection) {
            incidentCollection = new DailyStudentIncidentCollection([], {
                student: student,
                dateString: dateString
            });
            refresh = true;
            dailyIncidentsStore[cacheKey] = incidentCollection;
        }
        if (refresh) {
            // TODO: revisit the non-destructive nature of the fetch
            incidentCollection.fetch({remove: false});
        }

        return incidentCollection;
    };

    return exports;
});
