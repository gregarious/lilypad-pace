var app = angular.module('pace', ['ngMobile', 'underscore', 'widgets', 'backbone', 'moment']);

// override timeTracker for development
app.run(function(timeTracker) {
    timeTracker.getDateTimestamp = function() { return moment('2013-08-20T10:31'); };
    timeTracker.getDateString = function() { return '2013-08-20'; };
    timeTracker.getTimeString = function() { return '10:31'; };
    timeTracker.getCurrentPeriod = function() { return 3; };
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
