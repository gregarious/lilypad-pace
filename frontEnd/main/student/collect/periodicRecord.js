
app.controller('MainStudentCollectPeriodicRecordCtrl', function ($scope, periodicRecordDataStore, logEntryDataStore, timeTracker, _) {
    /** $scope initializing  **/

    // NOTE!!!
    // We are inheriting $scope.collectData from parent controller.
    // TODO: change this

    // Initialize $scope.data.selectedPeriodNumber to be the current period
    // according to the timeTracker
    $scope.data = {
        selectedPeriodNumber: timeTracker.currentPeriod
    };

    // Initialize $scope.availablePeriods
    $scope.availablePeriods = calculateAvailablePeriods(timeTracker.currentPeriod);

    /** actions on $scope **/
    // decrement points
    $scope.decrement = decrementCategory;


    /** Watches on $scope **/

    // watch the select input for changes
    $scope.$watch('data.selectedPeriodNumber', function(val) {
        showPeriod(val);
    });

    // when the recordCollection changes
    $scope.$watch('collectData.periodicRecordCollection', function(recordCollection) {
        showPeriod($scope.data.selectedPeriodNumber);
    });

    // TODO: insert logic to watch for current time/period changes; card #33

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
