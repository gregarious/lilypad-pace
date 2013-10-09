// controller for the incident log
app.controller('MainStudentCollectIncidentLogCtrl', function ($scope, mainViewState, timeTracker, logEntryDataStore, behaviorIncidentDataStore, behaviorIncidentTypeDataStore, pointLossDataStore, periodicRecordDataStore) {
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

    // initialize $scope.incidentLogCollection
    var selectedStudent = mainViewState.getSelectedStudent();
    setIncidentDataForStudent(selectedStudent);

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
        if (incident != undefined) {
            if (!$scope.editingIncidents || !incident.attributes.startedAt) {
                return;
            }

            $scope.currentIncidentEditing = incident;
            $scope.behaviorModalState.title = "Edit Incident";

            $scope.type = incident.get('type');
            $scope.data.startedAt = moment(incident.get('startedAt')).format("hh:mm")
            $scope.data.comment = incident.get('comment');

            if (incident.attributes.endedAt != null) {
                $scope.data.endedAt = moment(incident.get('endedAt')).format("hh:mm");
            }

        } else {
            // Close editing mode if open
            $scope.editingIncidents = false;
            $scope.confirmDeleteFor = null
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
            // TODO: FIGURE OUT WHY LABEL WONT UPDATE ON EDIT

            $scope.currentIncidentEditing.set('type', $scope.type);
            $scope.currentIncidentEditing.set('comment', $scope.data.comment);

            $scope.currentIncidentEditing.save();

            $scope.currentIncidentEditing = null;
        } else {
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
        // Note that since logEntry is connected to a PersistentStore-based
        // collection, it will automatically be removed from this collection
        // TODO-greg: this is kind of not great.
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

        $scope.confirmDeleteFor = null
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

        // Hooks $scope.incidentTypeCollection up to the given student's data
    var setIncidentTypesForStudent = function(student) {
        if (student) {
            var incidentTypeCollection = behaviorIncidentTypeDataStore.getTypesForStudent(student);

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
