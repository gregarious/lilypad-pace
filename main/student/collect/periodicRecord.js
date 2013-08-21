// controller for periodic records
app.controller('MainStudentCollectPeriodicRecordCtrl', function ($scope, appViewState, dailyLogEntryStore, timeTracker, _) {
    $scope.viewState = appViewState.collectViewState.periodicRecordViewState;

    // watch the time tracker: it will update when the current period changes
    $scope.timeTracker = timeTracker;
    $scope.$watch('timeTracker.currentPeriod', setAvailablePeriods);
    setAvailablePeriods(timeTracker.currentPeriod);

    // initialize $scope
    $scope.selectedPeriodNumber = timeTracker.currentPeriod;
    if ($scope.viewState.collection && $scope.viewState.collection.length) {
        $scope.selectedPeriod = $scope.viewState.collection.getByPeriod($scope.selectedPeriodNumber);
    }

    // TODO: should be able to get rid of/combine some of these watches
    // update the selectedPeriod if the PeriodRecord collection changes
    $scope.$watch('viewState.collection', function() {
        $scope.selectedPeriod = $scope.viewState.collection.getByPeriod($scope.selectedPeriodNumber);
    });
    // update the selectedPeriod if the PeriodRecord collection gets an update from the server
    $scope.$watch('viewState.collection.isSyncInProgress', function() {
        $scope.selectedPeriod = $scope.viewState.collection.getByPeriod($scope.selectedPeriodNumber);
    });

    // watch the select input for changes
    $scope.$watch('selectedPeriodNumber', function(val) {
        var number = parseInt(val, 10);
        $scope.selectedPeriod = $scope.viewState.collection.getByPeriod(number);
    });

    /** Functions **/

    // decrement the current student in the given category
    $scope.decrement = function (category) {
        var pointLossRecord = $scope.selectedPeriod.registerPointLoss(category);
        var student = $scope.selectedPeriod.get('student');
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
