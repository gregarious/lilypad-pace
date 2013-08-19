angular.module('pace').factory('attendanceAccessors', function(Backbone, moment, AttendanceSpan, $q) {
    /**
     * Returns a promise for a Collection of AttendanceSpan object.
     *
     * @param  {Student} student
     * @param  {String} startDate   ISO-formatted string
     * @param  {String} endDate     ISO-formatted string (exclusive range)
     * @return {Collection}
     */
    var studentHistory = function(student, startDate, endDate) {
        var rangeArgs = [];
        if (startDate) {
            rangeArgs.push('date__gte=' + moment(startDate).format());
        }
        if (endDate) {
            rangeArgs.push('date__lt=' + moment(endDate).format());
        }

        var spans = new (Backbone.Collection.extend({
            model: AttendanceSpan,
            url: student.get('attendanceSpansUrl') + (rangeArgs.length ? rangeArgs.join('&') : ''),
            comparator: function(span) {
                if (span.has('timeIn')) {
                    return -(moment(span.get('date') + 'T' + span.get('timeIn')).toDate());
                }
                else {
                    return -(moment(span.get('date')).toDate());
                }
            }
        }))();

        var deferred = $q.defer();
        spans.fetch({
            success: function(collection) {
                deferred.resolve(collection);
            },
            error: function(resp) {
                deferred.reject(resp);
            }
        });

        return deferred.promise;
    };

    return {
        studentHistory: studentHistory
    }
});
