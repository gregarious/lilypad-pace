// controller for the student list in the left panel
app.controller('MenuStudentListCtrl', function ($scope, mainViewState, studentDataStore) {
    /** $scope interface **/
    $scope.mainViewState = mainViewState;
    $scope.studentCollection = null;

    $scope.toggleAttendance = toggleAttendance;
    $scope.handleClick = handleClick;


    /** Actions on controller initialization **/

    // initialize the student list for the given classroom (will result in
    // null if there is no selected classroom)
    resetStudentListForClassroom(mainViewState.getSelectedClassroom());

    // also listen for future changes in selectedClassroom
    mainViewState.on('change:selectedClassroom', resetStudentListForClassroom);


    /** Implementation details **/

    function resetStudentListForClassroom(classroom) {
        if (classroom) {
            $scope.studentCollection = studentDataStore.getForClassroom(classroom);
        }
        else {
            $scope.studentCollection = null;
        }
    }

    // toggles attendance controls
    function toggleAttendance() {
        mainViewState.editingAttendance = !mainViewState.editingAttendance;
    }

    // handles click events on student list
    function handleClick(student) {
        // are we taking attendance or switching main content views between students?
        if (mainViewState.editingAttendance) {
            if (student.isPresent()) {
                student.markAbsent();
            }
            else {
                student.markPresent();
            }
        } else {
            mainViewState.setSelectedStudent(student);
            // mixpanel tracking
            mixpanel.track( 'Changed students');
        }
    }
});
