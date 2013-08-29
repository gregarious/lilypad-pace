/**
 * Manages collections of PeriodicRecords for the current date (according
 * to timeTracker).
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of PeriodicRecords
 */

angular.module('pace').factory('periodicRecordDataStore', function(timeTracker, periodicRecordCollectionFactories) {
    // PeriodicRecordCollection cache, indexed by student
    var cache = {};

    return {
        getDailyRecordsForStudent: function(student) {
            var collection = cache[student.id];
            if (!collection) {
                var today = timeTracker.getTimestampAsMoment().format('YYYY-MM-DD');
                var factory = periodicRecordCollectionFactories.dailyStudentRecords;
                collection = cache[student.id] = factory(student, today);
                collection.fetch();
            }
            return collection;
        }
    };
});
