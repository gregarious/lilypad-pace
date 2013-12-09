// parent controller for analyze
app.controller('MainStudentAnalyzeCtrl', function ($scope) {
    $scope.views = [
        {name: 'Rules', url: 'frontEnd/main/student/analyze/rules.html'},
        {name: 'Treatment Report', url: 'frontEnd/main/student/analyze/treatmentReport.html'},
        {name: 'Behavior Log', url: 'frontEnd/main/student/analyze/behaviorLog.html'},
        {name: 'Attendance Records', url: 'frontEnd/main/student/analyze/attendanceLog.html'}
    ];
});