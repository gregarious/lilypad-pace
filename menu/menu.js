app.controller('MenuCtrl', function($scope) {

});

app.directive('menu', function() {
    return {
        restrict: 'E',
        transclude: true,
        template: '<ul ng-transclude></ul>',
        replace: true
    }
});

app.directive('menuItem', function() {
    return {
        require: '^menu',
        restrict: 'E',
        transclude: true,
        template: '<li ng-transclude></li>',
        replace: true
    }
});