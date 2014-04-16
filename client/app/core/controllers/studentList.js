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
            var studentCollection = classroom.get('students');
            $scope.studentCollection = studentCollection;
            if (studentCollection.length > 0) {
                $scope.viewState.selectedStudent = studentCollection.models[0];
            }
        }
        else {
            $scope.studentCollection = null;
        }
    }

    // handles click events on student list: either change student or toggle attendance
    function handleClick(student) {
        if ($scope.viewState.editingAttendance) {
            dailyDataStore.toggleAttendanceForStudent(student);
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

    /**
     * Returns an object with the student's point totals for the given day.
     *
     * Result is an object is of the form: {
     *     retained: Number
     *     available: Number
     * }
     *
     * null is returned if the student has no data for the given day.
     *
     * @param  {Student} student
     * @return {Object}
     */
    function getStudentDailyPointTotals(student) {
        if (!dailyDataStore.hasDayBegun || !dailyDataStore.studentData[student.id]) {
            return null;
        }

        var result = {
            retained: 0,
            available: 0
        };

        dailyDataStore.studentData[student.id].periodicRecords.each(function(record) {
            var points = record.get('points');
            result.available += 8;
            result.retained += (points.kw + points.cw + points.bs + points.fd);
        });

        return result;
    }
});
