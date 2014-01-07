// controller for the behavior log
app.controller('AnalyzeAttendanceLogCtrl', function ($scope, attendanceDataStore) {

    $scope.$watch('viewState.selectedStudent', setAttendanceLogsForStudent);

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