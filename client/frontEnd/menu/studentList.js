// controller for the student list in the left panel
app.controller('MenuStudentListCtrl', function ($scope, mainViewState, studentDataStore, collectDataStore, mixpanel, timeTracker) {
    /** $scope interface **/
    $scope.mainViewState = mainViewState;

    // main student data
    $scope.studentCollection = null;

    // various local view state properties
    $scope.dataLoading = false;
    $scope.dataError = '';

    // UI event handling functions
    $scope.toggleAttendance = toggleAttendance;
    $scope.handleClick = handleClick;
    $scope.changeClassroom = changeClassroom;

    /** Actions on controller initialization **/

    // also listen for future changes in selectedClassroom
    $scope.$watch('mainViewState.selectedClassroom', resetStudentList);


    /** Implementation details **/

    function resetStudentList() {
        var classroom = mainViewState.selectedClassroom;

        if (classroom) {
            // show the loading indicator
            $scope.dataLoading = true;
            $scope.dataError = '';

            // fetch the students for the classroom
            studentDataStore.getForClassroom(classroom).then(
                function(collection) {
                    // on success, set the collection and clear error/loading states
                    $scope.studentCollection = collection;
                    $scope.dataError = '';
                    $scope.dataLoading = false;

                    // Auto-select first student
                    mainViewState.selectedStudent = $scope.studentCollection.models[0];
                }, function() {
                    // on failure, set an error and clear the collection & loading state
                    $scope.dataError = 'Error loading';
                    $scope.studentCollection = null;
                    $scope.dataLoading = false;
                    mainViewState.editingAttendance = false;
                }
            );
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

                // TODO: terrible #refactor this whole thing
                collectDataStore.loadTodayDataForStudent(student).then(function(data) {
                    var currPd = data.periodicRecordCollection.getByPeriod(timeTracker.currentPeriodNumber);
                    currPd.set('isEligible', true);
                    var points = currPd.get('points');
                    for (var pointType in points) {
                        if (points[pointType] === null) {
                            points[pointType] = 2;
                        }
                    }
                    currPd.save();
                }, function(err) {
                    console.error(err);
                });
            }
        } else {
            mainViewState.selectedStudent = student;
            mixpanel.track('Changed students');
        }
    }

    function changeClassroom() {
        mainViewState.selectedStudent = null;
        mainViewState.selectedClassroom = null;
    }
});
