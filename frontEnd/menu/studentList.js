// controller for the student list in the left panel
app.controller('MenuStudentListCtrl', function ($scope, mainViewState, studentDataStore) {
    // var fetchStudents = studentDataStore.getAllStudents();
    $scope.studentCollection = studentDataStore.getAllStudents();
    $scope.mainViewState = mainViewState;

    // toggles attendance controls
    $scope.toggleAttendance = function () {
        $scope.mainViewState.editingAttendance = !$scope.mainViewState.editingAttendance;
    };

    // handles click events on student list
    $scope.handleClick = function (student) {
        // are we taking attendance or switching main content views between students?
        if ($scope.mainViewState.editingAttendance) {
            if (student.isPresent()) {
                student.markAbsent();
            }
            else {
                student.markPresent();
            }
        } else {
            mainViewState.setSelectedStudent(student);
        }
    };
});
