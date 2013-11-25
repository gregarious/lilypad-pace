// maintains viewstate for main content area
app.controller('MainCtrl', function ($scope, mainViewState) {
    $scope.mainViewState = mainViewState;
    $scope.schoolDayEnded = function() {
        var d = new Date();

        // if after 3 pm
        if (d.getHours() >= 15) {
            return true;
        } else {
            return false;
        }
    };
});

// directive for the navigation tabs
app.directive('mainTabs', function (mixpanel) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function ($scope) {
            var panes = $scope.panes = [];

            $scope.select = function (pane) {
                angular.forEach(panes, function (pane) {
                    pane.selected = false;
                });
                mixpanel.track('Switched to ' + pane.title); // mixpanel tracking
                pane.selected = true;
            };

            this.addPane = function (pane) {
                if (panes.length === 0) $scope.select(pane);
                panes.push(pane);
            };
        },
        template: '<div>' +
            '<div class="clearfix tabWrapper">' +
            '<ul class="mainTabs">' +
            '<li ng-repeat="pane in panes" ng-click="select(pane)" ng-class="{selected:pane.selected}">' +
            '{{pane.title}}' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div class="tab-content" ng-transclude></div>' +
            '</div>',
        replace: true
    };
});

// directive for tab content
app.directive('mainPane', function () {
    return {
        require: '^mainTabs',
        restrict: 'E',
        transclude: true,
        scope: { title: '@', disabled: '=' },
        link: function (scope, element, attrs, mainTabsCtrl) {
            mainTabsCtrl.addPane(scope);
        },
        template: '<div class="hidden" ng-class="{active: selected, disabled: disabled}" ng-transclude>' +
            '</div>',
        replace: true
    };
});

// directive for modals that cover main content area
app.directive('mainModal', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {displayState: '='},
        controller: function ($scope) {
            $scope.closeModal = function () {
                // Note: this is not currently bound to in any HTML: parent
                // controllers are manipulating the `displayState` directly
                // instead
                $scope.displayState.active = false;
            };
        },
        template: '<div class="modalWrapper hidden" ng-class="{active: displayState.active}">' +
            '<div class="mainModal modal">' +
            '<div ng-transclude></div>' +
            '</div>' +
            '</div>',
        replace: true
    };
});