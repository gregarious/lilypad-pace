app.controller('MenuStudentListCtrl', function($scope, studentAccessors, viewService) {
    $scope.students = studentAccessors.allStudents().models; // list of students in class

    $scope.$watch(function() {return viewService}, function(data) {
        if (data.parameters.id !== undefined) {
            $scope.currentStudentId = data.parameters.id;
        }
        $scope.attendance = data.parameters.attendance; // whether attendance is being taken
    }, true);

    // toggles attendance controls
    $scope.toggleAttendance = function() {
        viewService.parameters.attendance = !viewService.parameters.attendance;
    };

    // handles click events on student list
    $scope.handleClick = function(studentId) {
        // are we taking attendance or switching main content views between students?
        if ($scope.attendance) {
            studentAccessors.allStudents().get(studentId).markAbsent();
        } else {
            viewService.currentView = 'student';
            viewService.parameters['id'] = studentId;
        }
    }
});