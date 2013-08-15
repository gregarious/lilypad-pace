// controller for periodic records
app.controller('MainStudentCollectPeriodicRecordCtrl', function ($scope, studentAccessors, periodicRecordAccessors, viewService) {
    var students = studentAccessors.allStudents();
    $scope.period = {};
    $scope.points = {};
    $scope.$watch(function () {
        return viewService
    }, function (data) {
        $scope.student = students.get([data.parameters.id]);

        // period object for current student
        // TODO: Allow for period selection
        // TODO: Handle isEligible
        // TODO: Handle non-existent periods
        $scope.period = periodicRecordAccessors.dailyStudentRecords($scope.student, '2013-08-12').getPeriodicRecord();
        $scope.isEligible = $scope.period.get('isEligible';)
        // points for four rules
        $scope.points.bs = $scope.period.getPointValue('bs');
        $scope.points.kw = $scope.period.getPointValue('kw');
        $scope.points.cw = $scope.period.getPointValue('cw');
        $scope.points.fd = $scope.period.getPointValue('fd');
    }, true);

    // decrement the current student in the given category
    $scope.decrement = function (category) {
        $scope.period.decrementPointValue(category);
    };

});