// maintains view state data for main content area for the student view
app.controller('MainStudentCollectCtrl', function($scope, studentService, behaviorIncidentService, periodicRecordService, viewService) {
    var students = studentService.allStudents();
    $scope.data = {};
    $scope.points = {}
    $scope.data.behaviorModalActive = false;
    $scope.addingIncident = false;
    $scope.$watch(function() {return viewService}, function(data) {
        //$scope.student = students.get([data.parameters.id]);
        $scope.attendance = data.parameters.attendance;
        $scope.incidentCollection = behaviorIncidentService.dailyStudentIncidents($scope.student);
        $scope.incidents = $scope.incidentCollection.models;
        $scope.incidentTypes = behaviorIncidentService.typesForStudent($scope.student).models;
        $scope.periodicRecordCollection = periodicRecordService.dailyStudentRecords($scope.student);
    }, true);


    $scope.decrement = function(category) {
        $scope.student[category]--;
    }

    $scope.openNewIncident = function() {
        $scope.addingIncident = true;
    }

    $scope.closeNewIncident = function() {
        $scope.addingIncident = false;
        $scope.data.type = $scope.data.startedAt = $scope.data.endedAt = $scope.data.comment = null;
    }

    $scope.showSettings = function() {
        $scope.data.behaviorModalActive = true;
    }

    $scope.submitIncident = function() {
        var today = new Date();
        $scope.data.startedAt.split(':')
        today.setHours($scope.data.startedAt[0]);
        today.setMinutes($scope.data.startedAt[1]);
        $scope.data.startedAt = today;
        if ($scope.data.endedAt) {
            today.setHours($scope.data.endedAt[0]);
            today.setMinutes($scope.data.endedAt[1]);
            $scope.data.startedAt = today;
        }
        var newIncident = $scope.incidentCollection.createIncident(
            $scope.data.type,
            $scope.data.startedAt,
            $scope.data.endedAt,
            $scope.data.comment);
        $scope.closeNewIncident();
    }
});