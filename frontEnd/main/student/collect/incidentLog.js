// controller for the incident log
app.controller('MainStudentCollectIncidentLogCtrl', function ($scope, mainViewState, timeTracker, logEntryDataStore, behaviorIncidentDataStore, behaviorIncidentTypeDataStore, pointLossDataStore, periodicRecordDataStore) {
    $scope.data = {};
    $scope.addingIncident = false;
    $scope.data.behaviorModalActive = false;

    // initialize $scope.incidentLogCollection
    var selectedStudent = mainViewState.getSelectedStudent();
    setIncidentDataForStudent(selectedStudent);

    /** View functions **/

    // opens the "new incident" control
    $scope.openNewIncident = function () {
        $scope.addingIncident = true;
    };

    // closes and clears the "new incident" control
    $scope.closeNewIncident = function () {
        $scope.addingIncident = false;
        $scope.data.type = $scope.data.startedAt = $scope.data.endedAt = $scope.data.comment = null;
    };

    // shows the settings modal
    $scope.showSettings = function () {
        $scope.data.behaviorModalActive = true;
    };

    // TODO: Should be doing responsive form validation here
    // TODO: Should confirm new incidents for students marked absent; card #76
    $scope.submitIncident = function () {
        var today = timeTracker.getTimestamp();
        var splitTime;
        console.log($scope.data);
        splitTime = $scope.data.startedAt.split(':');
        today.setHours(splitTime[0]);
        today.setMinutes(splitTime[1]);
        $scope.data.startedAt = today;

        if ($scope.data.endedAt) {
            today = timeTracker.getTimestamp();
            splitTime = $scope.data.endedAt.split(':');
            today.setHours(splitTime[0]);
            today.setMinutes(splitTime[1]);
            $scope.data.endedAt = today;
        }

        var newIncident = behaviorIncidentDataStore.createIncident(
            mainViewState.getSelectedStudent(),       // TODO: don't like this being directly view-state dependant; card #72
            $scope.data.type,
            $scope.data.startedAt,
            $scope.data.endedAt,
            $scope.data.comment);

        $scope.closeNewIncident();
    };

    $scope.removeIncident = function(logEntry) {
        // Note that since logEntry is connected to a PersistentStore-based
        // collection, it will automatically be removed from this collection
        // TODO: this is terrible. terrible.
        if (logEntry.has('periodicRecord')) {
            var record = logEntry.get('periodicRecord');
            if (record && !_.isUndefined(record.id)) {
                record = periodicRecordDataStore.getById(record.id);
                if (record) {
                    record.reversePointLoss(logEntry.get('pointType'));
                }
            }
        }
        logEntry.destroy();
    };

    /** Listeners to ensure view stays in sync with mainViewState **/

    // listen for the selected student to change
    mainViewState.on('change:selectedStudent', function(newSelected) {
        setIncidentDataForStudent(newSelected);
    });

    /**
     * Hooks $scope.incidentLogCollection & $scope.incidentTypeCollection up
     * to the given student's data
     */
    function setIncidentDataForStudent(student) {
        if (student) {
            $scope.incidentLogCollection = logEntryDataStore.getTodayForStudent(student);
            $scope.incidentTypeCollection = behaviorIncidentTypeDataStore.getTypesForStudent(student);
        }
        else {
            $scope.incidentLogCollection = null;
            $scope.incidentTypeCollection = null;
        }
    }
});
