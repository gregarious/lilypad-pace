// parent controller for analyze
app.controller('StudentAnalyzeCtrl', function ($scope) {
    $scope.views = [
        {name: 'Rules', url: 'app/analyze/views/rules.html'},
        {name: 'Treatment Report', url: 'app/analyze/views/treatmentReport.html'},
        {name: 'Behavior Log', url: 'app/analyze/views/behaviorLog.html'},
        {name: 'Attendance Records', url: 'app/analyze/views/attendanceLog.html'}
        {name: 'Treatment Period Manager', url: 'app/analyze/views/treatmentPeriodManager.html'}
    ];
});
