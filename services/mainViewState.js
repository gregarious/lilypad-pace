angular.module('pace').factory('mainViewState', function(_, Backbone, APIBackedCollection, dailyPeriodicRecordStore, dailyLogEntryStore, discussionPostStore) {
    var mainViewState = {};
    var _selectedStudent = null;

    mainViewState.getSelectedStudent = function() {
        return _selectedStudent;
    };

    mainViewState.setSelectedStudent = function(student) {
        _selectedStudent = student;
        mainViewState.trigger('change:selectedStudent', _selectedStudent);
    };

    _.extend(mainViewState, Backbone.Events);

    var periodicRecordViewState = {
        collection: new APIBackedCollection()
    };
    var activityLogViewState = {
        collection: new APIBackedCollection()
    };

    var collectViewState = {
        periodicRecordViewState: periodicRecordViewState,
        activityLogViewState: activityLogViewState
    };

    var discussViewState = {
        collection: new APIBackedCollection()
    };

    mainViewState.on('change:selectedStudent', function(newSelected) {
        periodicRecordViewState.collection = dailyPeriodicRecordStore.getForStudent(newSelected);
        activityLogViewState.collection = dailyLogEntryStore.getForStudent(newSelected);
        discussViewState.collection = discussionPostStore.getForStudent(newSelected);
    });

    mainViewState.collectViewState = collectViewState;
    mainViewState.discussViewState = discussViewState;

    return mainViewState;
});
