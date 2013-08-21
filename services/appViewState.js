angular.module('pace').factory('appViewState', function(_, Backbone, dailyPeriodicRecordStore, dailyLogEntryStore) {
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

    var collect = {
        periodicRecords: null,
        activityLog: null
    };

    selectedStudent.on('change', function() {
        var selected = selectedStudent.get();
        collect.periodicRecords = dailyPeriodicRecordStore.getForStudent(selected);
        collect.activityLog = dailyLogEntryStore.getForStudent(selected);
    });

    return {
        selectedStudent: selectedStudent,
        collect: collect
    };
});
