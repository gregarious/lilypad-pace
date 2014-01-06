app.controller('CollectPeriodPointsCtrl', function ($scope, $rootScope, dailyDataStore) {
    /** $scope initializing  **/

    $scope.selectedPeriodRecord = null;

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
        if ($scope.selectedPeriodRecord) {
            var lossRecord = $scope.selectedPeriodRecord.registerPointLoss(category);
            $rootScope.$broadcast('pointLossRegistered', lossRecord);
        }
    }

    function resetPointCounters(student, periodNumber) {
        $scope.selectedPeriodRecord = null;
        if (student && periodNumber) {
            var studentData = dailyDataStore.studentData[student.id];
            if (studentData.periodicRecords) {
                var selectedPeriods = studentData.periodicRecords.filter(function(pd) {
                    return pd.get('period') === periodNumber;
                });
                if (selectedPeriods.length > 0) {
                    $scope.selectedPeriodRecord = selectedPeriods[0];
                }
            }
        }
    }
});
