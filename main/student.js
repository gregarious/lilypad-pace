// maintains view state data for main content area for the student view
app.controller('MainStudentCtrl', function($scope, students, viewService) {
    $scope.behaviorModalActive = false

    $scope.$watch(function() {return viewService}, function(data) {
        $scope.student = students.students[data.parameters._id];
        $scope.attendance = data.parameters.attendance;
    }, true);

    $scope.showSettings = function() {
        $scope.behaviorModalActive = true;
    }
});

app.controller('behaviorModalCtrl', function($scope) {
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;

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