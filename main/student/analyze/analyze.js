// parent controller for analyze
app.controller('MainStudentAnalyzeCtrl', function ($scope, analyzeViewState) {
    $scope.views = [
        {name: 'Treatment Period', url: '/lilypad-client/lilypad-pace/main/student/analyze/treatmentPeriod.html'},
        {name: 'Behavior Log', url: '/lilypad-client/lilypad-pace/main/student/analyze/behaviorLog.html'},
        {name: 'Attendance Records', url: '/lilypad-client/lilypad-pace/main/student/analyze/attendanceRecords.html'}
    ];

    $scope.viewState = analyzeViewState;

});