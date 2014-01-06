app.controller('CollectPeriodPointsCtrl', function ($scope, dailyDataStore) {
    /** $scope initializing  **/

    $scope.pointValues = null;

    // watch for student or period change
    $scope.$watch('viewState.selectedStudent', function(student) {
        resetPointCounters(student, $scope.viewState.selectedPeriod);
    });
    $scope.$watch('viewState.selectedPeriod', function(pdNum) {
        resetPointCounters($scope.viewState.selectedStudent, pdNum);
    });

    // also watch for attendance status to change: when this happens to
    // the selected student, a new periodic record may exist
    $scope.$on('studentAttendanceChange', function(event, student, isNowPresent) {
        if (student === $scope.viewState.selectedStudent && isNowPresent) {
            resetPointCounters(
                $scope.viewState.selectedStudent,
                $scope.viewState.selectedPeriod);
        }
    });

    /** actions on $scope **/
    // decrement points
    $scope.decrementCategory = decrementCategory;

    function decrementCategory(category) {
        console.error('decrement not yet functional');
        // var pointLossRecord = $scope.selectedPeriod.registerPointLoss(category);
        // $scope.collectData.incidentLogCollection.add(pointLossRecord);
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
