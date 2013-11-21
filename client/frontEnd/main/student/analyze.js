// parent controller for analyze
app.controller('MainStudentAnalyzeCtrl', function ($scope) {
    $scope.views = [
        {name: 'Behavior Log', url: 'frontEnd/main/student/analyze/behaviorLog.html'},
        {name: 'Attendance Records', url: 'frontEnd/main/student/analyze/attendanceLog.html'}
    ];

    // Temorarily removed: {name: 'Treatment Period', url: 'frontEnd/main/student/analyze/treatmentPeriod.html'},
});
