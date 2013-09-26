/**
 * Manages collections of PeriodicRecords for the current date (according
 * to timeTracker).
 *
 * Interface:
 * - getDailyRecordsForStudent: Returns a Student-specific collection of
 *     PeriodicRecords applicable to the current date
 */

angular.module('pace').factory('periodicRecordDataStore', function(timeTracker, periodicRecordCollectionFactories) {
    return {
        getDailyRecordsForStudent: function(student) {
            var today = timeTracker.getTimestampAsMoment().format('YYYY-MM-DD');
            var collection = periodicRecordCollectionFactories.dailyStudentRecords(student, today);
            collection.fetch();
            return collection;
        }
    };
});
