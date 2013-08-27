// controller for periodic records
app.controller('MainStudentCollectPeriodicRecordCtrl', function ($scope, periodicRecordViewState, dailyLogEntryStore, timeTracker, _) {
    $scope.viewState = periodicRecordViewState;

    // watch the time tracker: it will update when the current period changes
    $scope.timeTracker = timeTracker;
    $scope.$watch('timeTracker.currentPeriod', setAvailablePeriods);
    setAvailablePeriods(timeTracker.currentPeriod);

    $scope.selectedPeriodNumber = $scope.viewState.getSelectedPeriodNumber();
    // watch the select input for changes
    $scope.$watch('selectedPeriodNumber', function(val) {
        var number = parseInt(val, 10);
        $scope.selectedPeriod = $scope.viewState.setSelectedPeriodNumber(number);
    });

    /** Functions **/

    // decrement the current student in the given category
    $scope.decrement = function (category) {
        var pointLossRecord = $scope.viewState.selectedPeriod.registerPointLoss(category);
        var student = $scope.viewState.selectedPeriod.get('student');
        var log = dailyLogEntryStore.getForStudent(student);
        log.add(pointLossRecord);
    };

    function setAvailablePeriods(maxPeriod) {
        if (maxPeriod) {
            $scope.availablePeriods = _.map(_.range(1, maxPeriod+1), function(pd) {
                return {
                    label: 'Period ' + pd,
                    value: pd
                };
            });
        }
        else {
            $scope.availablePeriods = [];
        }
    }
});
