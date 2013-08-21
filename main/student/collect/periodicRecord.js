// controller for periodic records
app.controller('MainStudentCollectPeriodicRecordCtrl', function ($scope, appViewState, dailyLogEntryStore, timeTracker, _) {
    var viewState = appViewState.collectViewState.periodicRecordViewState;

    $scope.periodicRecordViewState = viewState;
    $scope.selectedPeriod = null;
    $scope.periodNumber = 1;

    if (timeTracker.currentPeriod) {
        _g = $scope.availablePeriods = _.map(_.range(1, timeTracker.currentPeriod+1), function(pd) {
            return {
                label: 'Period ' + pd,
                value: pd
            };
        });
    }
    else {
        $scope.availablePeriods = [];
    }

    $scope.moo = {periodNumber: 1};

    // can't call getByPeriod on a PeriodicRecordCollection that hasn't synced yet
    $scope.$watch('periodicRecordViewState.collection.isSyncInProgress', function() {
        $scope.selectedPeriod = viewState.collection.getByPeriod($scope.periodNumber);
    });

    $scope.$watch('periodNumber', function(val) {
        console.log(val);
        var number = parseInt(val, 10);
        $scope.selectedPeriod = viewState.collection.getByPeriod(number);
    });

    // decrement the current student in the given category
    $scope.decrement = function (category) {
        var pointLossRecord = $scope.selectedPeriod.registerPointLoss(category);
        var student = $scope.selectedPeriod.get('student');
        var log = dailyLogEntryStore.getForStudent(student);
        log.add(pointLossRecord);
    };
});
