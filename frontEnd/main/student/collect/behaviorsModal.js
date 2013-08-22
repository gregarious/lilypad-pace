// controller for behavior options modal
app.controller('MainStudentCollectBehaviorsModalCtrl', function ($scope, studentAccessors, behaviorIncidentAccessors, viewService) {
    var students = studentAccessors.allStudents();
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;
    $scope.data = {};

    var fetchStudent = studentAccessors.allStudents();
    fetchStudent.then(function(students) {
        $scope.$watch(function () {
            return viewService
        }, function (data) {
            $scope.student = students.get([data.parameters.id]);
            $scope.studentTypes = _.filter($scope.incidentTypes, function (type) {
                return type.get('applicableStudent') !== null
            });
        }, true);

        // open the "add custom behavior" control
        $scope.openNewBehavior = function () {
            $scope.addingBehavior = true;
        };

        // close and clear the "add custom behavior" control
        $scope.closeNewBehavior = function () {
            $scope.addingBehavior = false;
            $scope.label = $scope.data.selectedBehaviorType = null;
        };

        // submit a new behavior
        // TODO: Should be doing responsive form validation here
        $scope.submitNewBehavior = function () {
            behaviorIncidentAccessors.studentBehaviorTypes($scope.student).createIncidentType($scope.label, $scope.data.selectedBehaviorType === 'Duration', null);
            $scope.closeNewBehavior();
        };
    });
});
