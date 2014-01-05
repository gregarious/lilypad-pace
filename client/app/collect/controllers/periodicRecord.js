app.controller('CollectPeriodicRecordCtrl', function ($scope, dailyDataStore) {
    /** $scope initializing  **/

    $scope.pointValues = null;

    $scope.$watch('viewState.selectedStudent', function(student) {
        resetPointCounters(student, $scope.viewState.selectedPeriod);
    });
    $scope.$watch('viewState.selectedPeriod', function(pdNum) {
        resetPointCounters($scope.viewState.selectedStudent, pdNum);
    });

    /** actions on $scope **/
    // decrement points
    $scope.decrement = decrementCategory;

    function decrementCategory(category) {
        var pointLossRecord = $scope.selectedPeriod.registerPointLoss(category);
        $scope.collectData.incidentLogCollection.add(pointLossRecord);
    }

    function resetPointCounters(student, periodNumber) {
        var foundRecord;
        if (student && periodNumber) {
            var studentData = dailyDataStore.studentData[student.id];
            if (studentData.periodicRecords) {
                var selectedPeriods = studentData.periodicRecords.filter(function(pd) {
                    return pd.get('period') === periodNumber;
                });
                if (selectedPeriods.length > 0) {
                    foundRecord = selectedPeriods[0];
                }
            }
        }

        if (foundRecord) {
            $scope.pointValues = foundRecord.get('points');
        }
        else {
            $scope.pointValues = null;
        }
    }
});
