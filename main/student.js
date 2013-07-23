// maintains view state data for main content area for the student view
app.controller('MainStudentCtrl', function($scope, studentService, behaviorIncidentService, viewService) {
    var students = studentService.allStudents();
    $scope.behaviorModalActive = false;
    $scope.addingIncident = false;
    $scope.$watch(function() {return viewService}, function(data) {
        $scope.student = students.get([data.parameters.id]);
        $scope.attendance = data.parameters.attendance;
        $scope.incidents = behaviorIncidentService.dailyStudentIncidents($scope.student).models;
        $scope.incidentTypes = behaviorIncidentService.typesForStudent($scope.student).models;
        $scope.studentTypes = _.filter($scope.incidentTypes, function(type) {return type.get('applicableStudent') !== null});
        console.log($scope.studentTypes);
    }, true);


    $scope.decrement = function(category) {
        $scope.student[category]--;
    }

    $scope.showAddIncident = function() {
        $scope.addingIncident = true;
    }

    $scope.showSettings = function() {
        $scope.behaviorModalActive = true;
    }

    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;

    // Incident Type Settings
    //$scope.behaviors = studentService.allStudents().get(viewService.parameters.id).get('behaviorIncidentTypes').models;
    //console.log(studentService.allStudents().get(viewService.parameters.id).get('behaviorIncidentTypes').models.length);

    $scope.showAddBehavior = function() {
        $scope.addingBehavior = true;
    }

    $scope.hideAddBehavior = function() {
        $scope.addingBehavior = false;
    }

    $scope.saveBehavior = function() {
        console.log($scope.description, $scope.selectedBehaviorType);
        $scope.addingBehavior = false;
    }
});