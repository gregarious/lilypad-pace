// controller for the behavior log
app.controller('AnalyzeAttendanceLogCtrl', function ($scope, analyzeDataSources) {

    $scope.attendanceSpanCollection = null;
    $scope.statusMessage = '';

    var ANALYZE_TAB_INDEX = 1;
    // when a new student is selected, update the attendance data only if analyze is selected
    $scope.$watch('viewState.selectedStudent', function(student) {
      if($scope.viewState.selectedTab == ANALYZE_TAB_INDEX) {
        setAttendanceLogsForStudent(student);
      }
    });
    // if the analyze tab is selected, update the current student's attendance
    $scope.$watch('viewState.selectedTab', function(selectedTab){
      if(selectedTab == ANALYZE_TAB_INDEX) {
        setAttendanceLogsForStudent($scope.viewState.selectedStudent);
      }
    });

    /**
     * Hooks $scope.attendanceSpanCollection up to the given student's data.
     */
    function setAttendanceLogsForStudent(student) {
        $scope.attendanceSpanCollection = null;
        if (student) {
            $scope.statusMessage = "Fetching attendance logs...";
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