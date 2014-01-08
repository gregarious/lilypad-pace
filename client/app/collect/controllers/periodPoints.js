app.controller('CollectPeriodPointsCtrl', function ($scope, $rootScope, dailyDataStore) {
    /** $scope initializing  **/

    $scope.selectedPeriodRecord = null;

    // variables necessary to display eligiblity status #refactor
    $scope.isSelectedPeriodCurrent = null;
    $scope.isStudentAbsent = null;

    // watch for student or period change
    $scope.$watch('viewState.selectedStudent', function(student) {
        resetPointCounters(student, $scope.viewState.selectedPeriod);
    });
    $scope.$watch('viewState.selectedPeriod', function(pdNum) {
        resetPointCounters($scope.viewState.selectedStudent, pdNum);
    });

    // also watch for attendance status to change: when this happens to
    // the selected student, a new periodic record may exist
    $scope.$on('studentAttendanceChange', function(event, student) {
        $scope.isStudentAbsent = isStudentAbsent(student);

        if (student === $scope.viewState.selectedStudent && !$scope.isStudentAbsent) {
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
        $scope.isSelectedPeriodCurrent = null;

        $scope.isStudentAbsent = isStudentAbsent(student);

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

            $scope.isSelectedPeriodCurrent = (periodNumber === dailyDataStore.currentPeriod);
        }
    }

    /**
     * Returns true when the given student is known to be absent, false
     * otherwise. This means it will return false if the day has not
     * begun.
     *
     * @param  {Student}  student
     * @return {Boolean}
     */
    function isStudentAbsent(student) {
        // if attendance status is unknown or not applicable for today, return false immediately
        if (!dailyDataStore.hasDayBegun || !dailyDataStore.studentData[student.id]) {
            return false;
        }

        return !dailyDataStore.studentData[student.id].activeAttendanceSpan;
    }

});
