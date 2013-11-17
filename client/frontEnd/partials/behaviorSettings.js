// controller for behavior options modal
app.controller('MainStudentCollectBehaviorsModalCtrl', function ($scope, mainViewState, timeTracker, behaviorIncidentDataStore, behaviorIncidentTypeDataStore, mixpanel) {
    // NOTE!!!
    // We are inheriting $scope.behaviorModalState and $scope.incidentFormData
    //   from MainStudentCollectIncidentLogCtrl so we can split the logic into
    //   two controllers.
    // #refactor

    // NOTE!!!
    // We are inheriting $scope.collectData from parent controller.
    // #refactor

    $scope.addingBehaviorType = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.behaviorTypeFormData = {};
    $scope.missingBehavior = false;
    $scope.missingBehaviorType = false;

    // TODO: Should be doing responsive form validation here
    // TODO: Should confirm new incidents for students marked absent; card #76
    $scope.submitIncident = function () {
        // Validate presence of behavior type
        if (typeof $scope.incidentFormData.typeModel === "undefined") {
            if ($scope.currentIncidentEditing && !$scope.currentIncidentEditing.has('periodicRecord')) {
                $scope.missingBehavior = true;
                return;
            }
        } else {
            $scope.missingBehavior = false;
        }

        var today = timeTracker.getTimestamp();
        var splitTime;
        splitTime = $scope.incidentFormData.startedAt.split(':');
        today.setHours(splitTime[0]);
        today.setMinutes(splitTime[1]);
        $scope.incidentFormData.startedAt = today;

        if ($scope.incidentFormData.endedAt) {
            today = timeTracker.getTimestamp();
            splitTime = $scope.incidentFormData.endedAt.split(':');
            today.setHours(splitTime[0]);
            today.setMinutes(splitTime[1]);
            $scope.incidentFormData.endedAt = today;
        }

        // If editing existing incident
        if ($scope.currentIncidentEditing) {
            $scope.currentIncidentEditing.set('startedAt', $scope.incidentFormData.startedAt);
            $scope.currentIncidentEditing.set('type', $scope.incidentFormData.typeModel);
            $scope.currentIncidentEditing.set('comment', $scope.incidentFormData.comment);

            if ($scope.incidentFormData.endedAt) {
                $scope.currentIncidentEditing.set('endedAt', $scope.incidentFormData.endedAt);
            }

            $scope.currentIncidentEditing.save();

            // manually re-sort the collection in case time changed
            $scope.collectData.incidentLogCollection.sort();
        } else {
            var timeOpened = (Date.now() - $scope.behaviorModalState.timeOpen) / 1000; // in seconds
            mixpanel.track("Incident added", { 'Time Open (s)': timeOpened }); // mixpanel tracking
            $scope.behaviorModalState.timeOpen = 0;

            var newIncident = behaviorIncidentDataStore.createIncident(
                mainViewState.selectedStudent,
                $scope.incidentFormData.typeModel,
                $scope.incidentFormData.startedAt,
                $scope.incidentFormData.endedAt,
                $scope.incidentFormData.comment);
            $scope.collectData.incidentLogCollection.add(newIncident);
        }

        $scope.closeBehaviorModel();
    };

    // set the desired behavior type
    $scope.setBehavior = function(selectedType) {
        $scope.incidentFormData.typeModel = selectedType;
    };

    // open the "add custom behavior" control
    $scope.openNewBehaviorType = function () {
        $scope.addingBehaviorType = true;
    };

    // close and clear the "add custom behavior" control
    $scope.closeNewBehaviorType = function () {
        $scope.addingBehaviorType = false;
        $scope.behaviorTypeFormData.label = null;
        $scope.behaviorTypeFormData.selectedBehaviorType = null;
    };

    // submit a new behavior
    // TODO: Should be doing responsive form validation here; card #80
    $scope.submitNewBehaviorType = function () {
        // Validate presence of behavior type
        if (typeof $scope.behaviorTypeFormData.selectedBehaviorType === "undefined") {
            $scope.missingBehaviorType = true;
            return;
        } else {
            $scope.missingBehaviorType = false;
        }

        mixpanel.track("Custom behavior added"); // mixpanel tracking
        behaviorIncidentTypeDataStore.createIncidentType(
            $scope.behaviorTypeFormData.label,
            $scope.behaviorTypeFormData.selectedBehaviorType === 'Duration',
            null,
            mainViewState.selectedStudent);
        // this operation will automatically add the type to collectData.behaviorTypeCollection

        $scope.closeNewBehaviorType();
    };
});
