// controller for the student list in the left panel
app.controller('MenuStudentListCtrl', function ($scope, mixpanel, timeTracker, dailyDataStore) {
    // main student data
    $scope.studentCollection = null;

    $scope.isStudentAbsent = isStudentAbsent;

    // UI event handling functions
    $scope.handleClick = handleClick;

    // listen for future changes in selectedClassroom
    $scope.$watch('viewState.selectedClassroom', resetStudentList);

    /** Implementation details **/

    function resetStudentList(classroom) {
        if (classroom) {
            $scope.studentCollection = classroom.get('students');
        }
        else {
            $scope.studentCollection = null;
        }
    }

    // handles click events on student list
    function handleClick(student) {
        // are we taking attendance or switching main content views between students?
        if ($scope.editingAttendance) {
            // DEV: temp disable attendance edit actions
            // if (student.isPresent()) {
            //     student.markAbsent();
            // }
            // else {
            //     student.markPresent();

            //     // TODO: terrible #refactor this whole thing
            //     collectDataStore.loadTodayDataForStudent(student).then(function(data) {
            //         var currPd = data.periodicRecordCollection.getByPeriod(timeTracker.currentPeriodNumber);
            //         // if we're here and we have a new periodic record, we can assume the POST request
            //         // had the correct value for `isEligible` because the request was made after the student
            //         // was marked present. yeah. it sucks. #refactor Part of card #125
            //         if (!currPd.isNew()) {
            //             currPd.set('isEligible', true);
            //             var points = currPd.get('points');
            //             for (var pointType in points) {
            //                 if (points[pointType] === null) {
            //                     points[pointType] = 2;
            //                 }
            //             }
            //             currPd.save();
            //         }
            //     }, function(err) {
            //         console.error(err);
            //     });
            // }
            console.error('change attendence disabled');
        } else {
            $scope.viewState.selectedStudent = student;
            mixpanel.track('Changed students');
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
