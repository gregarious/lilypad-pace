// controller for the behavior log
app.controller('MainStudentAnalyzeAttendanceLogCtrl', function ($scope, mainViewState, attendanceSpanStore) {
    // set up $scope.attendanceSpanCollection
    var selectedStudent = mainViewState.getSelectedStudent();
    setAttendanceLogsForStudent(selectedStudent);


    /** Listeners to ensure view stays in sync with mainViewState **/

    mainViewState.on('change:selectedStudent', function(newSelected) {
        setAttendanceLogsForStudent(newSelected);
    });

    /**
     * Hooks $scope.attendanceSpanCollection up to the given student's data.
     */
    function setAttendanceLogsForStudent(student) {
        if (student) {
            $scope.attendanceSpanCollection = attendanceSpanStore.getForStudent(student);
        }
        else {
            $scope.attendanceSpanCollection = null;
        }
    }
});