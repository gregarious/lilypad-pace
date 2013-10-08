var widgets = angular.module('widgets', ['underscore']);

// directive for small option sets
widgets.directive('buttonset', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {options: '=', value: '=', label: '@'},
        controller: function ($scope) {
            //$scope.selectedIndex = $scope.options.indexOf($scope.value);
            $scope.select = function (index) {
                $scope.selectedIndex = index;
                $scope.value = $scope.options[index];

            };
            $scope.isSelected = function (index) {
                return index === $scope.selectedIndex;
            };

        },
        template: '<div>' +
            '<ul class="buttonset">' +
            '<li ng-repeat="option in options" ng-click="select($index)" ng-class="{selected: isSelected($index)}">{{option}}</li>' +
            '</ul>' +
            '</div>',
        replace: true
    };
});

// directive for counter widgets
// enter if ye dare
widgets.directive('counter', function () {
    return {
        restrict: 'E',
        scope: { max: '@', min: '@', text: '@', value: '=', dec: '@', inc: '@', incFn: '&', decFn: '&', id: '='},
        controller: function ($scope) {

            var timeout = false;

            // call passed in increment and decrement functions
            $scope.increment = function () {
                if (!timeout && $scope.value < $scope.max) {
                    $scope.incFn();
                    timeout = true;
                    setTimeout(function () {
                        timeout = false;
                    }, 550);
                }
            };

            $scope.decrement = function () {
                if (!timeout && $scope.value > $scope.min) {
                    $scope.decFn();
                    timeout = true;
                    setTimeout(function () {
                        timeout = false;
                    }, 550);
                }
            }
        },
        link: function (scope, element) {
            var oldValue;
            var oldId;

            var countContainer = element[0].children[1];
            var counterElement = countContainer.children[0];

            scope.$watch('value', function (newValue) {
                if (scope.id !== undefined && newValue !== undefined) {
                    if (scope.id === oldId) {
                        animate();
                    } else {
                        scope.animate = false;
                        scope.currentValue = newValue;
                        oldValue = newValue;
                        oldId = scope.id;
                        setTimeout(function () {
                            scope.animate = true;
                        }, 0);
                    }
                }
            });

            // initial state of element
            element.ready(function () {
                counterElement.setAttribute("style", "margin-top:" + (-counterElement.clientHeight).toString() + "px");
                scope.currentValue = scope.value;
                setTimeout(function () {
                    counterElement.classList.add('animated');
                    oldValue = scope.value;
                }, 0);
            });

            counterElement.addEventListener('webkitTransitionEnd', function () {
                scope.currentValue = scope.value;
                scope.$digest();
                counterElement.classList.remove('animated');
                counterElement.setAttribute("style", "margin-top:" + (-counterElement.clientHeight).toString() + "px");
                setTimeout(function () {
                    counterElement.classList.add('animated');
                    oldValue = scope.value;
                }, 0);
            });

            var animate = function () {
                if (scope.value > oldValue) {
                    scope.upValue = scope.value;
                    counterElement.setAttribute("style", "margin-top: 0px")
                }

                if (scope.value < oldValue) {
                    scope.downValue = scope.value;
                    counterElement.setAttribute("style", "margin-top:" + (-2 * counterElement.clientHeight).toString() + "px")
                }
            }
        },
        template: '<div class="frequency-counter" ng-click="decrement()">' +
            '<ng-switch on="inc">' +
            '<div ng-switch-when="true" ng-class="{arrowDisabled: value == max, animated: animate}" class="arrow-container up" ng-click="increment()"><div class="arrow-up"></div></div>' +
            '</ng-switch>' +
            '<div class="countWrapper">' +
            '<div class="count">{{upValue}}</div>' +
            '<div class="count">{{currentValue}}</div>' +
            '<div class="count">{{downValue}}</div>' +
            '</div>' +
            '<div class="name">{{text}} {{inTransition}}</div>' +
            '<ng-switch on="dec">' +
            '<div ng-switch-when="true" ng-class="{arrowDisabled: value == min, animated: animate }" class="arrow-container down"><div class="arrow-down"></div></div>' +
            '</ng-switch>' +
            '</div>',
        replace: true
    };
});