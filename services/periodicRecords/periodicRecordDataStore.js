/**
 * Manages collections of PeriodicRecords for the current date (according
 * to timeTracker).
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of PeriodicRecords
 */

angular.module('pace').factory('periodicRecordDataStore', function(moment, timeTracker, periodicRecordCollectionFactories) {
    // PeriodicRecordCollection cache, indexed by student
    var cache = {};

    return {
        getDailyRecordsForStudent: function(student) {
            var collection = cache[student.id];
            if (!collection) {
                var factory = periodicRecordCollectionFactories.dailyStudentRecords;
                collection = cache[student.id] = factory(student, timeTracker.currentDate);
                collection.fetch();
            }
            return collection;
        }
    };
});
