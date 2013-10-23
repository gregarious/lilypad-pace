// controller for the incident log
app.controller('MainStudentCollectIncidentLogCtrl', function ($scope) {
    // NOTE!!!
    // We are inheriting $scope.collectData from parent controller and passing it to child.
    // #refactor

    // various view control state values
    $scope.editingIncidents = false;
    $scope.confirmDeleteFor = null;

    // state object needed by modal directive
    $scope.behaviorModalState = {'active': false, 'title': "Add New Incident"};

    // form-related objects shared with MainStudentCollectBehaviorsModalCtrl (needed
    //  in this scope for initiation reasons)
    $scope.incidentFormData = {};
    $scope.currentIncidentEditing = null;

    /** View functions **/

    // closes and clears the "new incident" control
    $scope.closeBehaviorModel = function () {
        $scope.behaviorModalState.active = false;
        $scope.incidentFormData = {};
    };

    // shows the settings modal
    $scope.showBehaviorModel = function (incident) {
        if (incident) {
            if (!$scope.editingIncidents || incident.has('periodicRecord')) {
                return;
            }

            $scope.currentIncidentEditing = incident;
            $scope.behaviorModalState.title = "Edit Incident";

            $scope.incidentFormData.typeModel = incident.get('type');

            $scope.incidentFormData.startedAt = moment(incident.get('startedAt')).format("HH:mm");
            $scope.incidentFormData.comment = incident.get('comment');

            if (incident.attributes.endedAt) {
                $scope.incidentFormData.endedAt = moment(incident.get('endedAt')).format("HH:mm");
            }

        } else {
            // Close editing mode if open
            $scope.editingIncidents = false;
            $scope.confirmDeleteFor = null;
            $scope.currentIncidentEditing = null;

            $scope.incidentFormData.startedAt = moment(Date.now()).format("HH:mm");
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
                // remove incident from log and destroy resource
                $scope.collectData.incidentLogCollection.remove(incident);
                incident.destroy();

                // reset confirm delete state
                $scope.confirmDeleteFor = null;
                return;
            }
        }

        $scope.confirmDeleteFor = incident;
    };

    $scope.removeIncident = function(logEntry) {
        // if record has a periodicRecord, it's a PointLoss and needs to go
        // through its parent PeriodicRecord to be destoryed correctly
        // #refactor
        var record = logEntry.get('periodicRecord');
        if (record) {
            record.reversePointLoss(logEntry.get('pointType'));
        }

        logEntry.destroy();

        $scope.confirmDeleteFor = null;
    };
});
