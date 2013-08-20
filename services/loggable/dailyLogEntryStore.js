/**
 * Manages collections of Loggable models for the current date (according
 * to timeTracker).
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of Loggables
 */
angular.module('pace').factory('dailyLogEntryStore', function(timeTracker, moment, logEntryCollectionFactory) {
    var cache = {};

    var buildCollection = function(student, date) {
        var startDate = moment(date).startOf('day').format();
        var endDate = moment(date).add(1, 'day').startOf('day').format();

        return logEntryCollectionFactory(student, startDate, endDate);
    };

    return {
        getForStudent: function(student) {
            var collection = cache[student.id];
            if (!collection) {
                collection = cache[student.id] = buildCollection(student, timeTracker.currentDate);
                collection.fetch();
            }
            return collection;
        }
    };
});
