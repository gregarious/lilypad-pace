var widgets = angular.module('widgets', ['underscore']);

widgets.directive('buttonset', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {options: '=', value: '=', label: '@'},
        controller: function ($scope, $element, $attrs) {
            //$scope.selectedIndex = $scope.options.indexOf($scope.value);
            $scope.select = function (index) {
                $scope.selectedIndex = index;
                $scope.value = $scope.options[index];

            }
            $scope.isSelected = function (index) {
                return index === $scope.selectedIndex;
            }

        },
        template: '<div>' +
            '<h3>{{label}}</h3>' +
            '<ul class="buttonset">' +
            '<li ng-repeat="option in options" ng-click="select($index)" ng-class="{selected: isSelected($index)}">{{option}}</li>' +
            '</ul>' +
            '</div>',
        replace: true
    };
});

// TODO: There be some timing bugs here....
// TODO: Should gray out arrows if value is at min or max
widgets.directive('counter', function () {
    return {
        restrict: 'E',
        scope: { max: '@', min: '@', text: '@', value: '=', dec: '@', inc: '@', incFn: '&', decFn: '&', id: '='},
        controller: function ($scope) {

            var timeout = false;

            $scope.increment = function () {
                if (!timeout && $scope.value < $scope.max) {
                    $scope.incFn();
                    timeout = true;
                    setTimeout(function () {
                        timeout = false;
                    }, 500);
                }
            }

            $scope.decrement = function () {
                if (!timeout && $scope.value > $scope.min) {
                    $scope.decFn();
                    timeout = true;
                    setTimeout(function () {
                        timeout = false;
                    }, 500);
                }
            }
        },
        link: function (scope, element) {
            var oldValue;
            var oldId;

            var countContainer = element[0].children[1];
            var counterElement = countContainer.children[0];
            element.ready(function() {
                counterElement.setAttribute("style", "margin-top:" + (-counterElement.clientHeight).toString() + "px");
                scope.currentValue = scope.value;
                setTimeout(function () {
                    counterElement.classList.add('animated');
                    oldValue = scope.value;
                }, 0);
            })

            scope.$watch('value', function (newValue) {
                if (scope.id === oldId) {
                    animate();
                } else {
                    scope.currentValue = newValue;

                    oldValue = newValue;
                    oldId = scope.id;
                }
            });
            counterElement.addEventListener('webkitTransitionEnd', function (event) {
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
        template:
            '<div class="frequency-counter">' +
                '<ng-switch on="inc">' +
                    '<div ng-switch-when="true" class="arrow-container up" ng-click="increment()"><div class="arrow-up"></div></div>' +
                '</ng-switch>' +
                '<div class="countWrapper">' +
                    '<div class="count">{{upValue}}</div>' +
                    '<div class="count">{{currentValue}}</div>' +
                    '<div class="count">{{downValue}}</div>' +
                '</div>' +
                '<div class="name">{{text}}</div>' +
                '<ng-switch on="dec">' +
                    '<div ng-switch-when="true" class="arrow-container down" ng-click="decrement()"><div class="arrow-down"></div></div>' +
                '</ng-switch>' +
            '</div>',
        replace: true
    };
});