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

    var _selectedPeriod = null;
    var periodicRecordViewState = {
        collection: new APIBackedCollection(),
        selectedPeriod: {
            get: function() {
                return _selectedPeriod;
            },
            set: function(period) {
                _selectedPeriod = period;
                this.trigger('change');
            }
        }
    };
    _.extend(periodicRecordViewState.selectedPeriod, Backbone.Events);

    var activityLogViewState = {
        collection: new APIBackedCollection()
    };

    var collectViewState = {
        periodicRecordViewState: periodicRecordViewState,
        activityLogViewState: activityLogViewState
    };

    var discuss = {
        posts: new APIBackedCollection()
    };

    selectedStudent.on('change', function() {
        var selected = selectedStudent.get();
        periodicRecordViewState.collection = dailyPeriodicRecordStore.getForStudent(selected);
        activityLogViewState.collection = dailyLogEntryStore.getForStudent(selected);
        discuss.posts = discussionPostStore.getForStudent(selected);
    });

    return {
        selectedStudent: selectedStudent,
        collectViewState: collectViewState,
        discuss: discuss
    };
});
