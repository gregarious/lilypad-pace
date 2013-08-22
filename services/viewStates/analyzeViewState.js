angular.module('pace').factory('analyzeViewState', function(APIBackedCollection, mainViewState, logEntryStore, attendanceSpanStore) {
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
        analyzeViewState.attendanceViewState.collection = attendanceSpanStore.getForStudent(newSelected);
    });

    return analyzeViewState;
});
