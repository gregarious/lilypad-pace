// parent controller to all student main views (collect, analyze, discuss)
app.controller('MainStudentCtrl', function ($scope) {
    $scope.$watch('viewState.selectedStudent', function(student) {
        $scope.student = student;
    });
});
