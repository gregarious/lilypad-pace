// controller for the incident log
app.controller('MainStudentCollectIncidentLogCtrl', function ($scope, mainViewState, collectViewState, viewService, studentAccessors, behaviorIncidentDataStore) {
    $scope.data = {};
    $scope.addingIncident = false;
    $scope.data.behaviorModalActive = false;

    $scope.behaviorTrackerViewState = collectViewState.behaviorTrackerViewState;
    $scope.activityLogViewState = collectViewState.activityLogViewState;

    /* View functions */

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
    // TODO: Should confirm new incidents for students marked absent
    $scope.submitIncident = function () {
        var today = new Date();
        var splitTime;
        splitTime = $scope.data.startedAt.split(':');
        today.setHours(splitTime[0]);
        today.setMinutes(splitTime[1]);
        $scope.data.startedAt = today;

        if ($scope.data.endedAt) {
            today = new Date();
            splitTime = $scope.data.endedAt.split(':');
            today.setHours(splitTime[0]);
            today.setMinutes(splitTime[1]);
            $scope.data.endedAt = today;
        }

        var newIncident = behaviorIncidentDataStore.createIncident(
            mainViewState.getSelectedStudent,       // TODO: don't like this being directly view-state dependant
            $scope.data.type,
            $scope.data.startedAt,
            $scope.data.endedAt,
            $scope.data.comment);

        $scope.activityLogViewState.collection.add(newIncident);
        $scope.closeNewIncident();
    };
});
