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

    return mainViewState;
});
