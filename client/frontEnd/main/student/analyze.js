// parent controller for analyze
app.controller('MainStudentAnalyzeCtrl', function ($scope) {
    $scope.views = [
        {name: 'Behavior Log', url: 'frontend/main/student/analyze/behaviorLog.html'},
        {name: 'Attendance Records', url: 'frontend/main/student/analyze/attendanceLog.html'}
    ];

    // Temorarily removed: {name: 'Treatment Period', url: 'frontend/main/student/analyze/treatmentPeriod.html'},
});