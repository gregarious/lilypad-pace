angular.module('pace').factory('appViewState', function(_, Backbone, APIBackedCollection, dailyPeriodicRecordStore, dailyLogEntryStore, discussionPostStore) {
    var _selectedStudent = null;
    var selectedStudent = {
        get: function() {
            return _selectedStudent;
        },
        set: function(student) {
            _selectedStudent = student;
            this.trigger('change');
        }
    };
    _.extend(selectedStudent, Backbone.Events);

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

    selectedStudent.on('change', function() {
        var selected = selectedStudent.get();
        periodicRecordViewState.collection = dailyPeriodicRecordStore.getForStudent(selected);
        activityLogViewState.collection = dailyLogEntryStore.getForStudent(selected);
        discussViewState.collection = discussionPostStore.getForStudent(selected);
    });

    return {
        selectedStudent: selectedStudent,
        collectViewState: collectViewState,
        discussViewState: discussViewState
    };
});
