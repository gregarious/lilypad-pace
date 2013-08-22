// parent controller for collect pane
app.controller('MainStudentAnalyzeCtrl', function ($scope, mainViewState) {
    $scope.views = [
        {name: 'Treatment Period', url: '/lilypad-client/lilypad-pace/main/student/analyze/treatmentPeriod.html'},
        {name: 'Behavior Log', url: '/lilypad-client/lilypad-pace/main/student/analyze/behaviorLogs.html'},
        {name: 'Attendance Records', url: '/lilypad-client/lilypad-pace/main/student/analyze/attendanceRecords.html'}
    ];
});