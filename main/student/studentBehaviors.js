// maintains view state data for main content area for the student view
app.controller('MainStudentBehaviorsCtrl', function($scope, studentAccessors, behaviorIncidentService, viewService) {
    var students = studentAccessors.allStudents();
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;
    $scope.data = {};
    $scope.$watch(function() {return viewService}, function(data) {
        $scope.student = students.get([data.parameters.id]);
        $scope.studentTypes = _.filter($scope.incidentTypes, function(type) {return type.get('applicableStudent') !== null});

    }, true);



    $scope.openNewBehavior = function() {
        $scope.addingBehavior = true;
    }

    $scope.closeNewBehavior = function() {
        $scope.addingBehavior = false;
        $scope.label = $scope.data.selectedBehaviorType = null;
    }

    $scope.submitNewBehavior = function() {
        behaviorIncidentService.typesForStudent($scope.student).createIncidentType($scope.label, $scope.data.selectedBehaviorType === 'Duration', null);
        $scope.closeNewBehavior();
    }
});