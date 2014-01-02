// parent controller for menus in the left panel
app.controller('MenuCtrl', function ($scope, $rootScope, classroomDataStore) {
    // necessary to know when to show hamburger menu
    $scope.availableClassrooms = classroomDataStore.classrooms;
    $scope.editingAttendance = false;

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
        if ($scope.viewState.selectedClassroom) {
            $scope.editingAttendance = !$scope.editingAttendance;
        }
    };
});
