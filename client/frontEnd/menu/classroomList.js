// controller for the classroom list in the left panel
app.controller('MenuClassroomListCtrl', function ($scope, mainViewState, studentDataStore, mixpanel) {
    /** $scope interface **/
    $scope.mainViewState = mainViewState;

    // various local view state properties
    $scope.dataLoading = false;
    $scope.dataError = '';

    // UI event handling functions
    $scope.selectClassroom = selectClassroom;

    /** Implementation details **/

    function selectClassroom(classroom) {
        mainViewState.selectedClassroom = classroom;
        mixpanel.track('Changed classrooms');
    }

});