// parent controller to all student main views (collect, analyze, discuss)
app.controller('MainStudentCtrl', function ($scope, studentAccessors, viewService) {
    var students = studentAccessors.allStudents();
    $scope.$watch(function () {
        return viewService
    }, function (data) {
        $scope.student = students.get([data.parameters.id]);
    }, true);
});