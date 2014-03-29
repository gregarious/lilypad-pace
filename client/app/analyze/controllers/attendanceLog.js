// controller for the behavior log
app.controller('AnalyzeAttendanceLogCtrl', function ($scope, analyzeDataSources) {

    $scope.attendanceSpanCollection = null;
    $scope.statusMessage = '';
    $scope.$watch('viewState.selectedStudent', setAttendanceLogsForStudent);

    /**
     * Hooks $scope.attendanceSpanCollection up to the given student's data.
     */
    function setAttendanceLogsForStudent(student) {
        $scope.attendanceSpanCollection = null;
        if (student) {
            $scope.statusMessage = "Fetching attendance logs...";
            mixpanel.track("Viewing Attendance Records");
            analyzeDataSources.fetchAttendanceLog(student).then(function(spans) {
                $scope.attendanceSpanCollection = spans;
                $scope.statusMessage = spans.length === 0 ?
                    "No attendance records yet logged" :
                    "";
            }, function(response) {
                $scope.statusMessage = "Error fetching logs";
            });
        }
        else {
            $scope.statusMessage = "No student selected";
        }
    }
});