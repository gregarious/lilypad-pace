// parent controller to all student main views (collect, analyze, discuss)
app.controller('MainStudentCtrl', function ($scope, studentAccessors, viewService) {

    // TODO: refactor this

    $scope.student = null;

	var fetchStudent = studentAccessors.allStudents();
	var students;
	fetchStudent.then(function(collection) {
		students = collection;
		$scope.$watch(function () {
			return viewService;
		}, function (data) {
			$scope.student = students.get(data.parameters.id);
		}, true);
    });
});
