// parent controller for menus in the left panel
app.controller('MenuCtrl', function ($scope) {
    $scope.systemMenuAcitve = false;

    $scope.toggleSystemMenu = function() {
        $scope.systemMenuActive = !$scope.systemMenuActive;
    };

    $scope.signOut = function() {
        $scope.systemMenuActive = false;
        $scope.logOut();
    };
});
