angular.module('pace').factory('mainViewState', function(_, Backbone, APIBackedCollection, dailyPeriodicRecordStore, dailyLogEntryStore, discussionPostStore) {
    var mainViewState = {};
    var _selectedStudent = null;

    mainViewState.getSelectedStudent = function() {
        return _selectedStudent;
    };

    mainViewState.setSelectedStudent = function(student) {
        _selectedStudent = student;
        console.log('yeah');
        mainViewState.trigger('change:selectedStudent', _selectedStudent);
    };

    _.extend(mainViewState, Backbone.Events);

    var discussViewState = {
        collection: new APIBackedCollection()
    };

    mainViewState.on('change:selectedStudent', function(newSelected) {
        discussViewState.collection = discussionPostStore.getForStudent(newSelected);
    });

    mainViewState.discussViewState = discussViewState;

    return mainViewState;
});
