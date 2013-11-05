// controller for the behavior log
app.controller('MainStudentAnalyzeAttendanceLogCtrl', function ($scope, mainViewState, attendanceDataStore) {

    /** Listeners to ensure view stays in sync with mainViewState **/
    $scope.mainViewState = mainViewState;
    $scope.$watch('mainViewState.selectedStudent', setAttendanceLogsForStudent);

    setAttendanceLogsForStudent($scope.mainViewState.selectedStudent);

    /**
     * Hooks $scope.attendanceSpanCollection up to the given student's data.
     */
    function setAttendanceLogsForStudent(student) {
        if (student) {
            $scope.attendanceSpanCollection = attendanceDataStore.getForStudent(student);
        }
        else {
            $scope.attendanceSpanCollection = null;
        }
    }
});