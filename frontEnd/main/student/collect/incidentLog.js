// controller for the incident log
app.controller('MainStudentCollectIncidentLogCtrl', function ($scope, collectViewState, viewService, studentAccessors, behaviorIncidentAccessors) {
    $scope.data = {};
    $scope.addingIncident = false;
    $scope.incidentTypes = [];

    $scope.activityLogViewState = collectViewState.activityLogViewState;

    // still doing the old-style async handling for retrieving behavior types
    var fetchStudent = studentAccessors.allStudents();
    fetchStudent.then(function(students) {
        $scope.$watch(function () {
            return viewService;
        }, function (data) {
            $scope.student = students.get(data.parameters.id);

            var fetchTypes = behaviorIncidentAccessors.studentBehaviorTypes($scope.student);
            fetchTypes.then(function(collection) {
                $scope.incidentTypes = collection.models;
            });
        }, true);
    });

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

        var newIncident = behaviorIncidentAccessors.createIncident(
            $scope.student,
            $scope.data.type,
            $scope.data.startedAt,
            $scope.data.endedAt,
            $scope.data.comment);

        $scope.activityLogViewState.collection.add(newIncident);
        $scope.closeNewIncident();
    };
});