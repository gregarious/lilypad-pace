var widgets = angular.module('widgets', ['underscore']);

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
});

widgets.directive('counter', function() {
    return {
        restrict: 'E',
        scope: { max: '@', min: '@', text: '@', value: '='},
        controller: function($scope, $element, $attrs) {

            // sanity checks
            if ($attrs.max === undefined || $attrs.min === undefined || $scope.value === undefined) {
                throw "Max, min, and value must all be defined";
                if ($attrs.max <= $attrs.min ) {
                    throw "Max must be greater than min for counter";
                }
            }

            // array of possible values for counter values
            $scope.values = _.range(parseInt($attrs.min), parseInt($attrs.max) + 1).reverse();

            // updates the counter's margin to move visible number
            var updateCounter = function() {
                var counterElement = $element[0].children[1].children[0]
                counterElement.setAttribute("style", "margin-top:" + (- ($scope.max - $scope.value) * counterElement.clientHeight).toString() + "px")
            }

            $scope.increment = function() {
                $scope.value = Math.min($scope.max, $scope.value + 1);
                updateCounter();
            }

            $scope.decrement = function() {
                $scope.value = Math.max($scope.min, $scope.value - 1);
                updateCounter();
            }

            // set the counter to the correct initial value when element is ready
            $element.ready(function() {
                updateCounter();
                // using setTimeout to avoid animating counters too early
                setTimeout(function() {
                    $element[0].children[1].children[0].className = $element[0].children[1].children[0].className + " animated";
                }, 0);
            })
        },
        template: '<div class="frequency-counter">' +
            '<div class="arrow-container" ng-click="increment()"><div class="arrow-up"></div></div>' +
            '<div class="countWrapper">' +
            '<div class="count" ng-repeat="i in values">{{i}}</div>' +
            '</div>' +
            '<div class="name">{{text}}</div>' +
            '<div class="arrow-container" ng-click="decrement()"><div class="arrow-down"></div></div>' +
            '</div>',
        replace: true
    };
});