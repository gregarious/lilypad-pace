/**
 * Manages collections of AttendanceSpan models.
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of AttendanceSpans
 *                  limited to a particular date range.
 * - getActiveSpans: Returns a Collection of AttendanceSpans that are currently
 *                   active (i.e. no time out yet).
 */
angular.module('pace').factory('attendanceDataStore', function(timeTracker, moment, AttendanceSpan, attendanceSpanCollectionFactories) {
    var cache = {};

    return {
        getForStudent: function(student, startDate, endDate) {
            // Note: endDate is an exclusive bound
            var collection = cache[student.id];
            if (!collection) {
                var factory = attendanceSpanCollectionFactories.studentSpans;
                collection = cache[student.id] = factory(student, startDate, endDate);
                collection.fetch();
            }
            return collection;
        },

        getActiveSpans: function() {
            // no caching this since it's ever-changing
            var spans = attendanceSpanCollectionFactories.allActiveSpans(
                timeTracker.getDateTimestamp());
            spans.fetch();
            return spans;
        },

        /**
         * Creates new AttendanceSpan object.
         *
         * @param  {Student} student
         * @param  {String} date    (ISO-formatted date string)
         * @param  {String} timeIn  (ISO-formatted time string)
         * @param  {String} timeOut (ISO-formatted time string)
         *
         * @return {AttendanceSpan}         [description]
         */
        createSpan: function(student, date, timeIn, timeOut) {
            var span = new AttendanceSpan({
                student: student,
                date: date,
                timeIn: timeIn,
                timeOut: timeOut
            });
            span.save();
            return span;
        }
    };
});
