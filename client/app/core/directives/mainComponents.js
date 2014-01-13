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
