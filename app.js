var app = angular.module('pace', ['ngMobile', 'underscore', 'widgets', 'backbone', 'moment']);

// debug settings for timeTracker
app.run(function(timeTracker) {
    timeTracker.currentDate = '2013-08-20';
    timeTracker.currentPeriod = 3;
});

app.run(function(mainViewState, collectViewState) {
    // do nothing -- just want to eagerly load the view states so event
    // listeners can hook into each other before their respective controllers
    // are first loaded. otherwise the injector can initialize them (and
    // therefore hook their listeners up) after events have already been
    // triggered
});

app.controller('main', function ($scope) {
    $scope.login = {};
    $scope.authenticated = true;

    $scope.logIn = function() {
        if ($scope.login.$valid) {
            $scope.login.username = $scope.login.password = undefined;
            $scope.authenticated = true;
        }
    };

    $scope.logOut = function() {
        $scope.authenticated = false;
    };
});
