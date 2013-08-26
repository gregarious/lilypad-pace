angular.module('pace').factory('collectViewState', function(_, Backbone, APIBackedCollection, mainViewState, dailyPeriodicRecordStore, dailyLogEntryStore, behaviorIncidentDataStore, timeTracker) {
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

    var behaviorTrackerViewState = {
        incidentTypeCollection: new APIBackedCollection(),
        studentTypes: []
    }

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

    var updateStudentTypes = function(typeCollection) {
        behaviorTrackerViewState.studentTypes = typeCollection.filter(function(type) {
            return type.get('applicableStudent') !== null
        });
    };

    mainViewState.on('change:selectedStudent', function(newSelected) {
        if (behaviorTrackerViewState.incidentTypeCollection) {
            behaviorTrackerViewState.incidentTypeCollection.off('sync', updateStudentTypes);
        }
        behaviorTrackerViewState.incidentTypeCollection = behaviorIncidentDataStore.getTypesForStudent(newSelected);
        behaviorTrackerViewState.incidentTypeCollection.on('sync', updateStudentTypes);
        updateStudentTypes(behaviorTrackerViewState.incidentTypeCollection);
    });

    return {
        periodicRecordViewState: periodicRecordViewState,
        activityLogViewState: activityLogViewState,
        behaviorTrackerViewState: behaviorTrackerViewState
    };
});
