/**
 * Manages collections of Loggable models.
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of Loggables limited
 *                  to a particular date range.
 */
angular.module('pace').factory('logEntryStore', function(timeTracker, moment, loggableCollectionFactories) {
    var cache = {};

    return {
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
