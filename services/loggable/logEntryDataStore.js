/**
 * Manages collections of Loggable models for the current date (according
 * to timeTracker).
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of Loggables
 */
angular.module('pace').factory('logEntryDataStore', function(timeTracker, moment, loggableCollectionFactories) {
    var cache = {};

    return {
        getDailyLogForStudent: function(student) {
            var collection = cache[student.id];
            if (!collection) {
                collection = cache[student.id] = loggableCollectionFactories.dailyStudentLog(student, timeTracker.currentDate);
                collection.fetch();
            }
            return collection;
        }
    };
});
