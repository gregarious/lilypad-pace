// parent controller to all student main views (collect, analyze, discuss)
app.controller('MainStudentCtrl', function ($scope, studentDataStore, mainViewState) {
    $scope.student = mainViewState.getSelectedStudent();

    mainViewState.on('change:selectedStudent', function(student) {
        $scope.student = student;
    });
});
