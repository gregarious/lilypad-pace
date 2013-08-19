// controller for periodic records
app.controller('MainStudentCollectPeriodicRecordCtrl', function ($scope, studentAccessors, periodicRecordAccessors, viewService) {
    $scope.period = {};
    $scope.points = {};

    var fetchStudents = studentAccessors.allStudents();
    fetchStudents.then(function(students) {
        $scope.$watch(function () {
            return viewService;
        }, function (data) {
            $scope.student = students.get([data.parameters.id]);

            // period object for current student
            // TODO: Allow for period selection
            // TODO: use actual date
            var fetchRecords = periodicRecordAccessors.dailyStudentRecords($scope.student, '2013-08-12');
            fetchRecords.then(function(records) {
                $scope.period = records.getPeriodicRecord(1);
                if ($scope.period) {
                    $scope.isEligible = $scope.period.get('isEligible');
                    // points for four rules
                    $scope.points.bs = $scope.period.getPointValue('bs');
                    $scope.points.kw = $scope.period.getPointValue('kw');
                    $scope.points.cw = $scope.period.getPointValue('cw');
                    $scope.points.fd = $scope.period.getPointValue('fd');
                } else {
                    // no records found
                    $scope.isEligible = false;
                    $scope.points.bs = $scope.points.kw = $scope.points.cw = $scope.points.fd = 2;
                }
            });
        }, true);

        // decrement the current student in the given category
        $scope.decrement = function (category) {
            var pointLossRecord = $scope.period.registerPointLoss(category);
            // TODO: Hayden: add this pointLossRecord to the activity log. It's Loggable.
        };
    });
});
