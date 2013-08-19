// controller for the incident log
app.controller('MainStudentCollectIncidentLogCtrl', function ($scope, studentAccessors, behaviorIncidentAccessors, logEntryAccessor, viewService, $q) {
    $scope.period = {};
    $scope.data = {};
    $scope.addingIncident = false;
    $scope.incidentTypes = [];
    $scope.activityLog = null;      // this will be a Collection of Loggable objects

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

            // TODO: not filtering by date yet
            var fetchLogEntries = logEntryAccessor($scope.student);
            fetchLogEntries.then(function(collection) {
                $scope.activityLog = collection;
            });
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

            var newIncident = behaviorIncidentAccessors.createIncident(
                $scope.student,
                $scope.data.type,
                $scope.data.startedAt,
                $scope.data.endedAt,
                $scope.data.comment);

            if ($scope.activityLog) {
                $scope.activityLog.add(newIncident);
            }

            $scope.closeNewIncident();
        };
    });
});