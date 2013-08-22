angular.module('pace').factory('collectViewState', function(_, Backbone, APIBackedCollection, mainViewState, dailyPeriodicRecordStore, dailyLogEntryStore, timeTracker) {
    var _selectedPeriodNumber = timeTracker.currentPeriod;
    var selectedStudentPeriods = new APIBackedCollection();

    var periodicRecordViewState = {
        selectedPeriod: null,
        getSelectedPeriodNumber: function() {
            return _selectedPeriodNumber;
        },
        setSelectedPeriodNumber: function(pd) {
            _selectedPeriodNumber = pd;
            updateSelectedPeriod();
            periodicRecordViewState.trigger('change:selectedPeriod', periodicRecordViewState.selectedPeriod);
        }
    };
    _.extend(periodicRecordViewState, Backbone.Events);

    var activityLogViewState = {
        collection: new APIBackedCollection()
    };

    // callback function to trigger whenever selected student
    var updateSelectedPeriod = function() {
        periodicRecordViewState.selectedPeriod = selectedStudentPeriods.getByPeriod(_selectedPeriodNumber);
    };

    mainViewState.on('change:selectedStudent', function(newSelected) {
        if (selectedStudentPeriods) {
            selectedStudentPeriods.off('sync', updateSelectedPeriod);
        }
        selectedStudentPeriods = dailyPeriodicRecordStore.getForStudent(newSelected);
        selectedStudentPeriods.on('sync', updateSelectedPeriod);
        updateSelectedPeriod();
    });

    mainViewState.on('change:selectedStudent', function(newSelected) {
        activityLogViewState.collection = dailyLogEntryStore.getForStudent(newSelected);
    });

    return {
        periodicRecordViewState: periodicRecordViewState,
        activityLogViewState: activityLogViewState
    };
});
