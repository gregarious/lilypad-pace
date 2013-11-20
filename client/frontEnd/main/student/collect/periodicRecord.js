
app.controller('MainStudentCollectPeriodicRecordCtrl', function ($scope, periodicRecordDataStore, logEntryDataStore, timeTracker, _) {
    /** $scope initializing  **/

    // NOTE!!!
    // We are inheriting $scope.collectData from parent controller.
    // #refactor

    // Initialize variable used to control selected period
    $scope.periodSelector = {
        availablePeriods: [],
        selectedPeriodNumber: timeTracker.currentPeriodNumber,
        maxPeriodValue: null,
    };
    configurePeriodSelector();

    /** actions on $scope **/
    // decrement points
    $scope.decrement = decrementCategory;

    $scope.timeTracker = timeTracker;

    /** Watches on $scope **/

    // watch the select input for changes
    $scope.$watch('periodSelector.selectedPeriodNumber', function(val) {
        showPeriod(val);
    });

    // if the current period changes, it was either user-initiated or due to
    // an out-of-date internal current period getting back into sync. Either way
    // we should increment the selector
    $scope.$watch('timeTracker.currentPeriodNumber', function(newPeriodNumber) {
        $scope.periodSelector.selectedPeriodNumber = newPeriodNumber;
    });

    // when the recordCollection changes, need to update $scope.selectedPeriod
    $scope.$watch('collectData.periodicRecordCollection', function(recordCollection) {
        showPeriod($scope.periodSelector.selectedPeriodNumber);
    });

    // when the the length of the records change, update the dropdown of available periods
    $scope.$watch('collectData.periodicRecordCollection.length', function(recordCollection) {
        configurePeriodSelector();
    });

    // Advances to next period
    $scope.prevPeriod = function() {
        if ($scope.periodSelector.selectedPeriodNumber > 1) {
            $scope.periodSelector.selectedPeriodNumber = $scope.periodSelector.selectedPeriodNumber - 1;
        }
    };

    // Moves to previous period
    $scope.nextPeriod = function() {
        if ($scope.periodSelector.selectedPeriodNumber + 1 <= $scope.periodSelector.maxPeriodValue) {
            $scope.periodSelector.selectedPeriodNumber = $scope.periodSelector.selectedPeriodNumber + 1;
        }
    };

    $scope.finishPointReview = function () {
        timeTracker.progressToNextPeriod();
    };

    $scope.enableMoveToNewPeriod = function() {
        // only enable "Point Review Complete" button if we're looking
        // at the current period and we're not at the end of the day
        return $scope.periodSelector.selectedPeriodNumber === $scope.periodSelector.maxPeriodValue &&
                $scope.periodSelector.selectedPeriodNumber < timeTracker.finalPeriodNumber;
    };


    /** Implementation details **/

    /**
     * Set $scope.periodSelector values based on current collectData available.
     */
    function configurePeriodSelector() {
        // default values in case no data is available
        $scope.periodSelector.availablePeriods = [];
        $scope.periodSelector.maxPeriodValue = null;

        // if collect data is available
        if ($scope.collectData && $scope.collectData.periodicRecordCollection) {
            var periodNumbers = $scope.collectData.periodicRecordCollection.getAvailablePeriods();
            if (periodNumbers.length > 0) {
                $scope.periodSelector.availablePeriods = _.map(periodNumbers, function(pdNum) {
                    return {
                        label: 'Period ' + pdNum,
                        value: pdNum
                    };
                });
                $scope.periodSelector.maxPeriodValue = _.max(periodNumbers);
            }
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
