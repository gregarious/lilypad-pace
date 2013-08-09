// maintains view state data for main content area for the student view
app.controller('MainStudentCtrl', function($scope, studentAccessors, behaviorIncidentService, periodicRecordService, viewService) {
    var students = studentAccessors.allStudents();
    $scope.$watch(function() {return viewService}, function(data) {
        $scope.student = students.get([data.parameters.id]);
    }, true);
});