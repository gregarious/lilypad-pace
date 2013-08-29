/**
 * Manages collections of Loggable models for the current date (according
 * to timeTracker).
 *
 * Interface:
 * - getTodaysForStudent: Returns a Student-specific collection of
 *     Loggables limited to a particular date.
 * - getForStudent: Returns a Student-specific collection of Loggables
 */
angular.module('pace').factory('logEntryDataStore', function(timeTracker, loggableCollectionFactories) {
    var todayCache = {};
    var cache = {};

    return {
        getTodaysForStudent: function(student) {
            var collection = todayCache[student.id];
            if (!collection) {
                var today = timeTracker.getTimestampAsMoment().format('YYYY-MM-DD');
                collection = todayCache[student.id] = loggableCollectionFactories.dailyStudentLog(
                    student, today);
                collection.fetch();
            }
            return collection;
        },

        getForStudent: function(student, startDate, endDate) {
            // Note: endDate is an exclusive bound
            var collection = cache[student.id];
            if (!collection) {
                var factory = loggableCollectionFactories.studentLog;
                collection = cache[student.id] = factory(student, startDate, endDate);
                collection.fetch();
            }
            return collection;
        }
    };
});
