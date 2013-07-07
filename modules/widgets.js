var widgets = angular.module('widgets', []);

widgets.directive('buttonset', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {options: '=', value: '=', label: '@'},
        controller: function($scope, $element, $attrs) {
            //$scope.selectedIndex = $scope.options.indexOf($scope.value);
            $scope.select = function(index) {
                $scope.selectedIndex = index;
                $scope.value = $scope.options[index];

            }
            $scope.isSelected = function(index) {
                return index === $scope.selectedIndex;
            }

        },
        template:
            '<div>' +
                '<h3>{{label}}</h3>' +
                '<ul class="buttonset">' +
                '<li ng-repeat="option in options" ng-click="select($index)" ng-class="{selected: isSelected($index)}">{{option}}</li>' +
                '</ul>' +
                '</div>',
        replace: true
    };
})