angular.module('pace').factory('collectViewState', function(_, Backbone, APIBackedCollection, mainViewState, dailyPeriodicRecordStore, dailyLogEntryStore) {
    var periodicRecordViewState = {
        collection: new APIBackedCollection()
    };
    var activityLogViewState = {
        collection: new APIBackedCollection()
    };

    mainViewState.on('change:selectedStudent', function(newSelected) {
        periodicRecordViewState.collection = dailyPeriodicRecordStore.getForStudent(newSelected);
        activityLogViewState.collection = dailyLogEntryStore.getForStudent(newSelected);
    });

    return {
        periodicRecordViewState: periodicRecordViewState,
        activityLogViewState: activityLogViewState
    };
});
