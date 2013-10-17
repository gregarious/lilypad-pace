// controller for the student list in the left panel
app.controller('MenuStudentListCtrl', function ($scope, mainViewState, studentDataStore) {
    /** $scope interface **/
    $scope.mainViewState = mainViewState;

    // main student data
    $scope.studentCollection = null;
    var activeAttendanceCollection = null;

    // various local view state properties
    $scope.dataLoading = false;
    $scope.dataError = '';

    // UI event handling functions
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
            // show the loading indicator
            $scope.dataLoading = true;
            $scope.dataError = '';

            // fetch the students for the classroom
            studentDataStore.getForClassroom(classroom, function(collection) {
                // on success, set the collection and clear error/loading states
                $scope.studentCollection = collection;
                $scope.dataError = '';
                $scope.dataLoading = false;
            }, function() {
                // on failure, set an error and clear the collection & loading state
                $scope.dataError = 'Error loading';
                $scope.studentCollection = null;
                $scope.dataLoading = false;
                mainViewState.editingAttendance = false;
            });
        }
        else {
            $scope.studentCollection = null;
            $scope.dataError = '';
        }
    }

    // toggles attendance controls
    function toggleAttendance() {
        if (!$scope.dataError) {
            mainViewState.editingAttendance = !mainViewState.editingAttendance;
        }
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
