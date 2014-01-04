// parent controller for menus in the left panel
app.controller('MenuCtrl', function ($scope, $rootScope, classroomDataStore, dailyDataStore) {
    // necessary to know when to show hamburger menu
    $scope.availableClassrooms = classroomDataStore.classrooms;
    $scope.editingAttendance = false;

    // hook into data store to give view access to dailyDataStore.hasDayBegun
    $scope.dailyDataStore = dailyDataStore;

    $scope.signOut = function() {
        $scope.systemMenuActive = false;
        $rootScope.$broadcast('logOut');
    };


    $scope.changeClassroom = function() {
        if ($scope.availableClassrooms.length !== 1) {
            $scope.viewState.selectedStudent = null;
            $scope.viewState.selectedClassroom = null;
        }
    };

    // toggles attendance controls
    $scope.toggleAttendance = function() {
        // no-op if day hasn't begun (edit attendance shouldn't be visible)
        if (dailyDataStore.hasDayBegun) {
            if ($scope.viewState.selectedClassroom) {
                $scope.editingAttendance = !$scope.editingAttendance;
            }
        }
    };
});
