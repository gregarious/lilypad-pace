// controller for the incident log
app.controller('MainStudentCollectIncidentLogCtrl', function ($scope, mainViewState, timeTracker, logEntryDataStore, behaviorIncidentDataStore) {
    $scope.data = {};
    $scope.addingIncident = false;
    $scope.editingIncidents = false;
    $scope.currentIncidentEditing = null;
    $scope.confirmDeleteFor = null;

    // state object needed by modal state
    $scope.behaviorModalState = {'active': false, 'title': "Add New Incident"};

    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;
    $scope.label = null;

    // initialize $scope.incidentLogCollection
    var selectedStudent = mainViewState.getSelectedStudent();
    setIncidentDataForStudent(selectedStudent);

    /** View functions **/

    // closes and clears the "new incident" control
    $scope.closeBehaviorModel = function () {
        $scope.addingIncident = false;
        $scope.data.type = $scope.data.startedAt = $scope.data.endedAt = $scope.data.comment = null;
        $scope.label = null;

        $scope.behaviorModalState.active = false;
    };

    // shows the settings modal
    $scope.showBehaviorModel = function (incident) {
        if (incident != undefined) {
            if (!$scope.editingIncidents || !incident.attributes.startedAt) {
                return;
            }

            $scope.currentIncidentEditing = incident;
            $scope.behaviorModalState.title = "Edit Incident";

            $scope.label = incident.attributes.type;
            $scope.data.startedAt = moment(incident.attributes.startedAt).format("hh:mm")
            $scope.data.comment = incident.attributes.comment;

            if (incident.attributes.endedAt != null) {
                $scope.data.endedAt = moment(incident.attributes.endedAt).format("hh:mm");
            }

        } else {
            $scope.currentIncidentEditing = null;
            $scope.behaviorModalState.title = "Add New Incident";
        }

        $scope.behaviorModalState.active = true;
    };

    $scope.editIncidents = function() {
        $scope.editingIncidents = !$scope.editingIncidents;
        $scope.confirmDeleteFor = null
    }

    $scope.confirmDelete = function(incident) {
        if ($scope.confirmDeleteFor != null) {
            if ($scope.confirmDeleteFor.id == incident.id) {
                $scope.confirmDeleteFor = null
                return;
            }
        }

        $scope.confirmDeleteFor = incident;
    }

    $scope.deleteIncident = function() {

        // TODO: DELETE INCIDENT HERE.

        $scope.confirmDeleteFor = null
    }

    // TODO: Should be doing responsive form validation here
    // TODO: Should confirm new incidents for students marked absent; card #76
    $scope.submitIncident = function () {

        // Handle updates to existing incidents
        if ($scope.currentIncidentEditing) {
            var startedAt = $scope.currentIncidentEditing.attributes.startedAt;
            var splitTime;
            splitTime = $scope.data.startedAt.split(':');
            startedAt.setHours(splitTime[0]);
            startedAt.setMinutes(splitTime[1]);

            $scope.currentIncidentEditing.attributes.startedAt = startedAt;

            if ($scope.data.endedAt) {
                var endedAt = $scope.currentIncidentEditing.attributes.endedAt;
                splitTime = $scope.data.endedAt.split(':');
                startedAt.setHours(splitTime[0]);
                startedAt.setMinutes(splitTime[1]);

                $scope.currentIncidentEditing.attributes.endedAt = endedAt;
            }

            // TODO: FIGURE OUT WHY LABEL WONT UPDATE ON EDIT

            $scope.currentIncidentEditing.attributes.label = $scope.label;
            $scope.currentIncidentEditing.attributes.comment = $scope.data.comment;
            
            $scope.closeBehaviorModel();

            return;
        }

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
        $scope.closeBehaviorModel();
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
