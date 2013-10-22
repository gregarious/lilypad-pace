// parent controller to all student main views (collect, analyze, discuss)
app.controller('MainStudentCtrl', function ($scope, studentDataStore, mainViewState) {
    $scope.mainViewState = mainViewState;
    $scope.student = mainViewState.selectedStudent;

    $scope.$watch('mainViewState.selectedStudent', function(student) {
        $scope.student = student;
    });
});
