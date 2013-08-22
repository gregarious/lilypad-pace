/**
 * Manages collections of AttendanceSpan models.
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of AttendanceSpans
 *                  limited to a particular date range.
 */
angular.module('pace').factory('attendanceSpanStore', function(timeTracker, moment, attendanceSpanCollectionFactories) {
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
        }
    };
});
