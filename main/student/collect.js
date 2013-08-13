// maintains view state data for main content area for the student view
app.controller('MainStudentCollectCtrl', function($scope, studentAccessors, behaviorIncidentAccessors, periodicRecordAccessors, viewService) {
    $scope.period = {};
    $scope.data = {};
    $scope.points = {};
    $scope.data.behaviorModalActive = false;
    $scope.addingIncident = false;
    $scope.$watch(function() {return viewService}, function(data) {
        //$scope.student = students.get([data.parameters.id]);
        $scope.attendance = data.parameters.attendance;
        $scope.period = periodicRecordAccessors.dailyStudentRecords($scope.student, '2013-08-12').getPeriodicRecord();
        $scope.points.bs = $scope.period.getPointValue('bs');
        $scope.points.kw = $scope.period.getPointValue('kw');
        $scope.points.cw = $scope.period.getPointValue('cw');
        $scope.points.fd = $scope.period.getPointValue('fd');
        $scope.incidentCollection = behaviorIncidentAccessors.dailyStudentIncidents($scope.student);
        $scope.incidents = $scope.incidentCollection.models;
        $scope.incidentTypes = behaviorIncidentAccessors.studentBehaviorTypes($scope.student).models;
        console.log($scope.points)
    }, true);

    $scope.decrement = function(category) {
        $scope.period.decrementPointValue(category);
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