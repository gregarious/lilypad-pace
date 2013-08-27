angular.module('pace').factory('periodicRecordViewState', function(_, Backbone, APIBackedCollection, mainViewState, dailyPeriodicRecordStore, timeTracker) {
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

    return periodicRecordViewState;
});
