// controller for the incident log
app.controller('MainStudentCollectIncidentLogCtrl', function ($scope, studentAccessors, behaviorIncidentAccessors, viewService) {
    var students = studentAccessors.allStudents();
    $scope.period = {};
    $scope.data = {};
    $scope.addingIncident = false;
    $scope.$watch(function () {
        return viewService
    }, function (data) {
        $scope.student = students.get([data.parameters.id]);
        $scope.incidentCollection = behaviorIncidentAccessors.dailyStudentIncidents($scope.student);
        $scope.incidents = $scope.incidentCollection.models;
        $scope.incidentTypes = behaviorIncidentAccessors.studentBehaviorTypes($scope.student).models;
    }, true);

    // opens the "new incident" control
    $scope.openNewIncident = function () {
        $scope.addingIncident = true;
    };

    // closes and clears the "new incident" control
    $scope.closeNewIncident = function () {
        $scope.addingIncident = false;
        $scope.data.type = $scope.data.startedAt = $scope.data.endedAt = $scope.data.comment = null;
    };

    // TODO: Should be doing responsive form validation here
    // TODO: Should confirm new incidents for students marked absent
    $scope.submitIncident = function () {
        var today = new Date();
        $scope.data.startedAt.split(':');
        today.setHours($scope.data.startedAt[0]);
        today.setMinutes($scope.data.startedAt[1]);
        $scope.data.startedAt = today;
        if ($scope.data.endedAt) {
            today.setHours($scope.data.endedAt[0]);
            today.setMinutes($scope.data.endedAt[1]);
            $scope.data.startedAt = today;
        }
        $scope.incidentCollection.createIncident(
            $scope.data.type,
            $scope.data.startedAt,
            $scope.data.endedAt,
            $scope.data.comment);
        $scope.closeNewIncident();
    };
});