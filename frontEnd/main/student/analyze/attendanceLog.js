// controller for the behavior log
app.controller('MainStudentAnalyzeAttendanceLogCtrl', function ($scope, mainViewState) {
    $scope.attendanceLog = $scope.viewState.attendanceViewState.collection.models
});