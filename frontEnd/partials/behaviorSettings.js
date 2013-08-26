// controller for behavior options modal
app.controller('MainStudentCollectBehaviorsModalCtrl', function ($scope, collectViewState, studentAccessors, behaviorIncidentDataStore, viewService) {
    var students = studentAccessors.allStudents();
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;
    $scope.data = {};

    $scope.behaviorTrackerViewState = collectViewState.behaviorTrackerViewState;

    // open the "add custom behavior" control
    $scope.openNewBehavior = function () {
        $scope.addingBehavior = true;
    };

    // close and clear the "add custom behavior" control
    $scope.closeNewBehavior = function () {
        $scope.addingBehavior = false;
        $scope.label = $scope.data.selectedBehaviorType = null;
    };

    // submit a new behavior
    // TODO: Should be doing responsive form validation here
    $scope.submitNewBehavior = function () {
        // TODO: don't like the direct view state dependancy here
        var studentTypes = $scope.behaviorTrackerViewState.incidentTypeCollection;
        studentTypes.createIncidentType(
            $scope.label,
            $scope.data.selectedBehaviorType === 'Duration',
            null);
        $scope.closeNewBehavior();
    };
});
