// controller for the incident log
app.controller('MainStudentCollectIncidentLogCtrl', function ($scope, mainViewState, timeTracker, logEntryDataStore, behaviorIncidentDataStore, behaviorIncidentTypeDataStore, pointLossDataStore, periodicRecordDataStore) {
    // NOTE!!!
    // We are inheriting $scope.collectData from parent controller.
    // TODO: change this

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
    $scope.type = null;

    /** View functions **/

    // closes and clears the "new incident" control
    $scope.closeBehaviorModel = function () {
        $scope.addingIncident = false;
        $scope.data.type = $scope.data.startedAt = $scope.data.endedAt = $scope.data.comment = null;
        $scope.type = null;

        $scope.behaviorModalState.active = false;
    };

    // shows the settings modal
    $scope.showBehaviorModel = function (incident) {
        if (incident) {
            if (!$scope.editingIncidents || incident.has('periodicRecord')) {
                 return;
             }

            $scope.currentIncidentEditing = incident;
            $scope.behaviorModalState.title = "Edit Incident";

            $scope.type = incident.get('type');

            $scope.data.startedAt = moment(incident.get('startedAt')).format("hh:mm");
            $scope.data.comment = incident.get('comment');

            if (incident.attributes.endedAt) {
                $scope.data.endedAt = moment(incident.get('endedAt')).format("hh:mm");
            }

        } else {
            // Close editing mode if open
            $scope.editingIncidents = false;
            $scope.confirmDeleteFor = null;
            $scope.currentIncidentEditing = null;

            $scope.data.startedAt = moment(Date.now()).format("hh:mm");
            $scope.behaviorModalState.title = "Add New Incident";
        }

        $scope.behaviorModalState.active = true;
    };

    $scope.editIncidents = function() {
        $scope.editingIncidents = !$scope.editingIncidents;
        $scope.confirmDeleteFor = null;
    };

    $scope.confirmDelete = function(incident) {
        if ($scope.confirmDeleteFor) {
            if ($scope.confirmDeleteFor.id == incident.id) {
                $scope.confirmDeleteFor = null;
                return;
            }
        }

        $scope.confirmDeleteFor = incident;
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

        // If editing existing incident
        if ($scope.currentIncidentEditing) {
            $scope.currentIncidentEditing.set('startedAt', $scope.data.startedAt);
            $scope.currentIncidentEditing.set('type', $scope.type);
            $scope.currentIncidentEditing.set('comment', $scope.data.comment);

            if ($scope.data.endedAt) {
                $scope.currentIncidentEditing.set('endedAt', $scope.data.endedAt);
            }

            $scope.currentIncidentEditing.save();
            $scope.collectData.incidentLogCollection.sort();
            $scope.currentIncidentEditing = null;
        } else {
            mixpanel.track("Incident added"); // mixpanel tracking
            var newIncident = behaviorIncidentDataStore.createIncident(
                mainViewState.getSelectedStudent(),       // TODO: don't like this being directly view-state dependant; card #72
                $scope.type,
                $scope.data.startedAt,
                $scope.data.endedAt,
                $scope.data.comment);
        }

        $scope.closeBehaviorModel();
    };

    $scope.removeIncident = function(logEntry) {
        // if record has a periodicRecord, it's a PointLoss and needs to go
        // through its parent PeriodicRecord to be destoryed correctly
        // TODO-greg: wouldn't hurt to hide these details in the collect store
        var record = logEntry.get('periodicRecord');
        if (record) {
            record.reversePointLoss(logEntry.get('pointType'));
        }

        logEntry.destroy();

        $scope.confirmDeleteFor = null;
    };

    /** Listeners to ensure view stays in sync with mainViewState **/

    // initialize the collect data for the given student (will result in
    // null if there is no selected student)
    resetIncidentData(mainViewState.getSelectedStudent());

    // also listen for future changes in selectedClassroom
    mainViewState.on('change:selectedStudent', resetIncidentData);

    /**
     * Hooks $scope.incidentTypeCollection up to the given student's data
     */
    function resetIncidentData(student) {
        if (student) {
            behaviorIncidentTypeDataStore.getTypesForStudent(student).then(function(collection) {
                $scope.incidentTypeCollection = collection;
            }, function(err) {
                $scope.incidentTypeCollection = null;
            });
        }
        else {
            $scope.incidentTypeCollection = null;
        }
    }

        // Hooks $scope.incidentTypeCollection up to the given student's data
    var setIncidentTypesForStudent = function(student) {
        if (student) {
            behaviorIncidentTypeDataStore.getTypesForStudent(student).then(
                updateStudentOnlyTypes,
                function(err) {
                   $scope.studentOnlyTypes = [];
                }
            );
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
        $scope.type = $scope.data.selectedBehaviorType = null;
    };

    // set the desired behavior type
    $scope.setBehavior = function(selectedType) {
        $scope.type = selectedType.attributes;
    };

    // submit a new behavior
    // TODO: Should be doing responsive form validation here; card #80
    $scope.submitNewBehavior = function () {
        behaviorIncidentTypeDataStore.createIncidentType(
            $scope.data.label,
            $scope.data.selectedBehaviorType === 'Duration',
            null,
            mainViewState.getSelectedStudent());
        updateStudentOnlyTypes($scope.incidentTypeCollection);
        $scope.closeNewBehavior();

    };

    /** Listeners to ensure view stays in sync with mainViewState **/

    // listen for the selected student to change
    mainViewState.on('change:selectedStudent', function(newSelected) {
        setIncidentTypesForStudent(newSelected);
    });
});
