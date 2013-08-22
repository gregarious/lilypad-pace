angular.module('pace').factory('analyzeViewState', function(APIBackedCollection, mainViewState, logEntryStore) {
    var analyzeViewState = {
        logViewState: {
            collection: new APIBackedCollection()
        },
        attendanceViewState: {
            collection: new APIBackedCollection()
        }
    };

    mainViewState.on('change:selectedStudent', function(newSelected) {
        analyzeViewState.logViewState.collection = logEntryStore.getForStudent(newSelected);
    });

    return analyzeViewState;
});
