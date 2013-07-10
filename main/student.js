// maintains view state data for main content area for the student view
app.controller('MainStudentCtrl', function($scope, studentService, viewService) {
    $scope.behaviorModalActive = false

    $scope.decrement = function(category) {
        $scope.student[category]--;
    }

    $scope.increment = function(category) {
        $scope.student[category]++;
    }

    $scope.$watch(function() {return viewService}, function(data) {
        $scope.student = studentService.getStudents().get([data.parameters.id]);
        $scope.attendance = data.parameters.attendance;
    }, true);

    $scope.showSettings = function() {
        $scope.behaviorModalActive = true;
    }
});

app.controller('behaviorModalCtrl', function($scope, studentService, viewService) {
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;

    $scope.behaviors = studentService.getStudents().get(viewService.parameters.id).get('behaviorIncidentTypes').models;
    console.log(studentService.getStudents().get(viewService.parameters.id).get('behaviorIncidentTypes').models.length);

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