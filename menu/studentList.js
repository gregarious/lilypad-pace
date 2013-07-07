app.controller('MenuStudentListCtrl', function($scope, students, viewService) {
    $scope.students = students.students; // list of students in class

    $scope.$watch(function() {return viewService}, function(data) {
        if (data.parameters._id !== undefined) {
            $scope.currentStudentId = students.students[data.parameters._id]._id; // selected student id
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
            students.students[studentId].present = !students.students[studentId].present;
        } else {
            viewService.currentView = 'student';
            viewService.parameters['_id'] = studentId;
        }
    }
});