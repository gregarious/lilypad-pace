// maintains viewstate for main content area
app.controller('MainCtrl', function($scope, viewService) {
    $scope.$watch(function() {return viewService}, function(data) {
        $scope.view = data.currentView; // the current view
        $scope.attendance = data.parameters.attendance; // whether attendance is being taken
    }, true);
});

app.directive('mainTabs', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function($scope, $element) {
            var panes = $scope.panes = [];

            $scope.select = function(pane) {
                angular.forEach(panes, function(pane) {
                    pane.selected = false;
                });
                pane.selected = true;
            }

            this.addPane = function(pane) {
                if (panes.length == 0) $scope.select(pane);
                panes.push(pane);
            }
        },
        template:
            '<div>' +
                '<div class="clearfix">' +
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

app.directive('mainPane', function() {
    return {
        require: '^mainTabs',
        restrict: 'E',
        transclude: true,
        scope: { title: '@', disabled: '=' },
        link: function(scope, element, attrs, mainTabsCtrl) {
            mainTabsCtrl.addPane(scope);
        },
        template:
            '<div class="hidden" ng-class="{active: selected, disabled: disabled}" ng-transclude>' +
                '</div>',
        replace: true
    };
})

app.directive('mainModal', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {active: '=', title: '@'},
        controller: function($scope) {
            $scope.closeModal = function() {
                $scope.active = false;
                console.log($scope.active);
            }
        },
        template:
            '<div class="mainModal modal hidden" ng-class="{active: active}">' +
                '<div class="clearfix">' +
                '<h2>{{title}}</h2>' +
                '<button class="close" ng-click="closeModal()">Close</button>' +
                '</div>' +
                '<div ng-transclude></div>' +
                '</div>',
        replace: true
    }
});
