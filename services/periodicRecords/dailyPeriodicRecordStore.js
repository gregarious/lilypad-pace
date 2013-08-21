/**
 * Manages collections of PeriodicRecords for the current date (according
 * to timeTracker).
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of PeriodicRecords
 */

angular.module('pace').factory('dailyPeriodicRecordStore', function(moment, timeTracker, periodicRecordCollectionFactory) {
    // PeriodicRecordCollection cache, indexed by student
    var cache = {};

    return {
        getForStudent: function(student) {
            var collection = cache[student.id];
            if (!collection) {
                collection = cache[student.id] = periodicRecordCollectionFactory(student,
                    timeTracker.currentDate);
                collection.fetch();
            }
            return collection;
        }
    };
});
