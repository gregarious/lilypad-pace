// parent controller to all student main views (collect, analyze, discuss)
app.controller('MainContentCtrl', function ($scope) {
    $scope.studentLabel = '';
    $scope.$watch('viewState.selectedStudent', function(student) {
        if (student) {
            $scope.studentLabel = student.get('firstName') + " " + student.get('lastName');
        }
        else {
            $scope.studentLabel = '';
        }
    });
});
