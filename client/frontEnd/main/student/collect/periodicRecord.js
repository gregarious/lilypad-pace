
app.controller('MainStudentCollectPeriodicRecordCtrl', function ($scope, periodicRecordDataStore, logEntryDataStore, timeTracker, _) {
    /** $scope initializing  **/

    // NOTE!!!
    // We are inheriting $scope.collectData from parent controller.
    // #refactor

    // Initialize $scope.data.selectedPeriodNumber to be the current period
    // according to the timeTracker
    $scope.data = {
        selectedPeriodNumber: timeTracker.currentPeriodNumber
    };

    // Initialize $scope.availablePeriods/maxPeriodValue
    $scope.availablePeriods = calculateAvailablePeriods(timeTracker.currentPeriodNumber);
    $scope.maxPeriodValue = _.max(_.pluck($scope.availablePeriods, 'value'));

    /** actions on $scope **/
    // decrement points
    $scope.decrement = decrementCategory;

    $scope.timeTracker = timeTracker;

    /** Watches on $scope **/

    // watch the select input for changes
    $scope.$watch('data.selectedPeriodNumber', function(val) {
        showPeriod(val);
    });

    // when the recordCollection changes, need to update $scope.selectedPeriod
    $scope.$watch('collectData.periodicRecordCollection', function(recordCollection) {
        showPeriod($scope.data.selectedPeriodNumber);
    });

    // when the the length of the records change, update the dropdown of available periods
    $scope.$watch('collectData.periodicRecordCollection.length', function(recordCollection) {
        $scope.availablePeriods = calculateAvailablePeriods(timeTracker.currentPeriodNumber);
        $scope.maxPeriodValue = _.max(_.pluck($scope.availablePeriods, 'value'));
    });

    // if the current period changes, and we're currently displaying the current period,
    // we should auto-increment to the next one
    $scope.$watch('timeTracker.currentPeriodNumber', function(newPeriodNumber) {
        if ($scope.data.selectedPeriodNumber === newPeriodNumber-1) {
            $scope.data.selectedPeriodNumber = newPeriodNumber;
        }
    });

    // Advances to next period
    $scope.prevPeriod = function() {
        if ($scope.data.selectedPeriodNumber > 1) {
            $scope.data.selectedPeriodNumber = $scope.data.selectedPeriodNumber - 1;
        }
    };

    // Moves to previous period
    $scope.nextPeriod = function() {
        if ($scope.data.selectedPeriodNumber + 1 <= $scope.maxPeriodValue) {
            $scope.data.selectedPeriodNumber = $scope.data.selectedPeriodNumber + 1;
        }
    };

    /** Implementation details **/
    function calculateAvailablePeriods(maxPeriod) {
        if (maxPeriod) {
            return _.map(_.range(1, maxPeriod+1), function(pd) {
                return {
                    label: 'Period ' + pd,
                    value: pd
                };
            });
        }
        else {
            return [];
        }
    }

    function showPeriod(period) {
        var pd = parseInt(period, 10);
        if ($scope.collectData && pd) {
            $scope.selectedPeriod = $scope.collectData.periodicRecordCollection.getByPeriod(pd);
        }
        else {
            $scope.selectedPeriod = null;
        }
    }

    function decrementCategory(category) {
        var pointLossRecord = $scope.selectedPeriod.registerPointLoss(category);
        $scope.collectData.incidentLogCollection.add(pointLossRecord);
    }
});
