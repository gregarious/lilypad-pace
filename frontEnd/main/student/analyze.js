// parent controller for analyze
app.controller('MainStudentAnalyzeCtrl', function ($scope) {
    $scope.views = [
        {name: 'Treatment Period', url: '/lilypad-client/lilypad-pace/frontend/main/student/analyze/treatmentPeriod.html'},
        {name: 'Behavior Log', url: '/lilypad-client/lilypad-pace/frontend/main/student/analyze/behaviorLog.html'},
        {name: 'Attendance Records', url: '/lilypad-client/lilypad-pace/frontend/main/student/analyze/attendanceLog.html'}
    ];
});