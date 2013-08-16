// parent controller for menus in the left panel
app.controller('MenuCtrl', function ($scope) {
    $scope.systemMenuAcitve = false;

    $scope.toggleSystemMenu = function() {
        $scope.systemMenuActive = !$scope.systemMenuActive;
    }

    $scope.signOut = function() {
        $scope.systemMenuActive = false;
        $scope.logOut();
    }
});

// directive for menus in the left panel
app.directive('menu', function () {
    return {
        restrict: 'E',
        transclude: true,
        template: '<ul ng-transclude></ul>',
        replace: true
    }
});

// directive for menu items
app.directive('menuItem', function () {
    return {
        require: '^menu',
        restrict: 'E',
        transclude: true,
        template: '<li ng-transclude></li>',
        replace: true
    }
});