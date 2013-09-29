// controller for the incident log
app.controller('MainStudentCollectIncidentLogCtrl', function ($scope, mainViewState, timeTracker, logEntryDataStore, behaviorIncidentDataStore) {
    $scope.data = {};
    $scope.addingIncident = false;
    $scope.behaviorModalActive = false;
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;
    $scope.label = null;

    // initialize $scope.incidentLogCollection
    var selectedStudent = mainViewState.getSelectedStudent();
    setIncidentDataForStudent(selectedStudent);

    /** View functions **/

    // closes and clears the "new incident" control
    $scope.closeNewIncident = function () {
        $scope.addingIncident = false;
        $scope.data.type = $scope.data.startedAt = $scope.data.endedAt = $scope.data.comment = null;
        $scope.label = null;
        
        $scope.behaviorModalActive = false;
        // ^^^ BehaviorModalActive is now false. Why is the modal still visible?
    };

    // shows the settings modal
    $scope.showSettings = function () {
        $scope.behaviorModalActive = true;
        console.log($scope.behaviorModalActive);
    };

    // TODO: Should be doing responsive form validation here
    // TODO: Should confirm new incidents for students marked absent; card #76
    $scope.submitIncident = function () {
        var today = timeTracker.getTimestamp();
        var splitTime;
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
            mainViewState.getSelectedStudent,       // TODO: don't like this being directly view-state dependant; card #72
            $scope.label,
            $scope.data.startedAt,
            $scope.data.endedAt,
            $scope.data.comment);

        $scope.incidentLogCollection.add(newIncident);
        $scope.closeNewIncident();
    };

    /**
     * Hooks $scope.incidentLogCollection & $scope.incidentTypeCollection up
     * to the given student's data
     */
    function setIncidentDataForStudent(student) {
        if (student) {
            $scope.incidentLogCollection = logEntryDataStore.getTodaysForStudent(student);
            $scope.incidentTypeCollection = behaviorIncidentDataStore.getTypesForStudent(student);
        }
        else {
            $scope.incidentLogCollection = null;
            $scope.incidentTypeCollection = null;
        }
    }

        // Hooks $scope.incidentTypeCollection up to the given student's data
    var setIncidentTypesForStudent = function(student) {
        if (student) {
            var incidentTypeCollection = behaviorIncidentDataStore.getTypesForStudent(student);

            // Can't guarantee the incident types have synced yet. If not, set up a callback
            if (incidentTypeCollection.isSyncInProgress) {
                incidentTypeCollection.once("sync", updateStudentOnlyTypes);
            }
            else {
                updateStudentOnlyTypes(incidentTypeCollection);
            }
        }
        else {
            $scope.studentOnlyTypes = [];
        }
    };

    var updateStudentOnlyTypes = function(incidentTypeCollection) {
        // Note this creates a bare array of IncidentTypes, *not* a Collection!
        $scope.studentOnlyTypes = incidentTypeCollection.filter(function(type) {
            return type.get('applicableStudent') !== null;
        });
    };

    // initialize $scope.incidentTypeCollection and $scope.studentOnlyTypes
    var selectedStudent = mainViewState.getSelectedStudent();
    setIncidentTypesForStudent(selectedStudent);

    // open the "add custom behavior" control
    $scope.openNewBehavior = function () {
        $scope.addingBehavior = true;
    };

    // close and clear the "add custom behavior" control
    $scope.closeNewBehavior = function () {
        $scope.addingBehavior = false;
        $scope.label = $scope.data.selectedBehaviorType = null;
    };

    // set the desired behavior type
    $scope.setBehavior = function(selectedType) {
        $scope.label = selectedType;
    };

    // submit a new behavior
    // TODO: Should be doing responsive form validation here; card #80
    $scope.submitNewBehavior = function () {
        $scope.incidentTypeCollection.createIncidentType(
            $scope.data.label,
            $scope.data.selectedBehaviorType === 'Duration',
            null);
        updateStudentOnlyTypes($scope.incidentTypeCollection);
        $scope.closeNewBehavior();

    };

    /** Listeners to ensure view stays in sync with mainViewState **/

    // listen for the selected student to change
    mainViewState.on('change:selectedStudent', function(newSelected) {
        setIncidentTypesForStudent(newSelected);
    });
});
