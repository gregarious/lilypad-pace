// maintains view state data for main content area for the student view
app.controller('MainStudentBehaviorsCtrl', function($scope, studentService, behaviorIncidentService, viewService) {
    var students = studentService.allStudents();
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;
    $scope.data = {};
    $scope.$watch(function() {return viewService}, function(data) {
        $scope.student = students.get([data.parameters.id]);
        $scope.studentTypes = _.filter($scope.incidentTypes, function(type) {return type.get('applicableStudent') !== null});
    }, true);



    // Incident Type Settings
    //$scope.behaviors = studentService.allStudents().get(viewService.parameters.id).get('behaviorIncidentTypes').models;
    //console.log(studentService.allStudents().get(viewService.parameters.id).get('behaviorIncidentTypes').models.length);

    $scope.openNewBehavior = function() {
        $scope.addingBehavior = true;
    }

    $scope.closeNewBehavior = function() {
        $scope.addingBehavior = false;
    }

    $scope.submitNewBehavior = function() {
        console.log($scope.description, $scope.selectedBehaviorType);
        $scope.addingBehavior = false;
    }
});