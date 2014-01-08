// parent controller for analyze
app.controller('StudentAnalyzeCtrl', function ($scope) {
    $scope.views = [
        // {name: 'Rules', url: 'app/analyze/views/rules.html'},
        // temporarily disabled
        // {name: 'Treatment Report', url: 'frontEnd/main/student/analyze/treatmentReport.html'},
        {name: 'Behavior Log', url: 'app/analyze/views/behaviorLog.html'},
        {name: 'Attendance Records', url: 'app/analyze/views/attendanceLog.html'}
    ];
});
