// maintains view state data for main content area for the student view
app.controller('MainStudentCtrl', function($scope, studentService, behaviorIncidentService, viewService) {
    var students = studentService.allStudents();
    $scope.behaviorModalActive = false;
    $scope.addingIncident = false;
    $scope.data = {};
    $scope.$watch(function() {return viewService}, function(data) {
        $scope.student = students.get([data.parameters.id]);
        $scope.attendance = data.parameters.attendance;
        $scope.incidentCollection = behaviorIncidentService.dailyStudentIncidents($scope.student);
        $scope.incidents = $scope.incidentCollection.models;
        $scope.incidentTypes = behaviorIncidentService.typesForStudent($scope.student).models;
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
        console.log($scope.behaviorModalActive);
        $scope.behaviorModalActive = true;
    }

    $scope.submitIncident = function() {
        var newIncident = $scope.incidentCollection.createIncident(
            $scope.data.type, 
            $scope.data.startedAt, 
            $scope.data.endedAt, 
            $scope.data.comment);
        newIncident.save();
        $scope.closeNewIncident();
    }
});