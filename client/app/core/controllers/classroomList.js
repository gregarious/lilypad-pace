// controller for the classroom list in the left panel
app.controller('MenuClassroomListCtrl', function ($scope, mixpanel, classroomDataStore) {
    $scope.statusMessage = '';
    $scope.classroomCollection = '';

    // UI event handling functions
    $scope.selectClassroom = selectClassroom;

    // listen for root scope's `accessWasGranted` broadcast before
    // loading classrooms

    // when user is authenicated, reset the list
    $scope.$watch('viewState.isUserAuthenticated', resetClassroomList);

    /** Implementation details **/
    function resetClassroomList(isUserAuthenticated) {
        if (isUserAuthenticated) {
            $scope.statusMessage = "Loading classrooms...";

            classroomDataStore.loadAccessibleClassrooms().then(function(classroomCollection) {
                // note that argument is the same as classRoomDataStore.classrooms
                $scope.classroomCollection = classroomCollection;
                $scope.viewState.selectedClassroom = null;

                if (classroomCollection.length === 0) {
                    $scope.statusMessage = "No classrooms found for user";
                }
                else {
                    $scope.statusMessage = "";
                    if (classroomCollection.length === 1) {
                        // skip the classroom list setup and set the selected one immediately
                        var onlyClassroom = classroomCollection.models[0];
                        selectClassroom(onlyClassroom);
                    }
                }
            }, function(reason) {
                console.error("Failure: %o", reason);
                $scope.statusMessage = "error";
                $scope.classroomCollection = null;
            });
        } else {
            classroomDataStore.clear();
            // clear all classrooms if user is not authenicated
            $scope.statusMessage = "";
            $scope.classroomCollection = null;
        }
    }

    function selectClassroom(classroom) {
        $scope.viewState.selectedClassroom = classroom;
        mixpanel.track('Changed classrooms');
    }
});
