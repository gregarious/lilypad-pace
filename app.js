var app = angular.module('pace', ['ngMobile', 'underscore', 'widgets', 'backbone', 'moment']);

// debug settings for timeTracker
app.run(function(timeTracker) {
    timeTracker.currentDate = '2013-08-20';
    timeTracker.currentPeriod = 3;
});

app.controller('main', function ($scope) {
    $scope.login = {};
    $scope.authenticated = true;

    $scope.logIn = function() {
        if ($scope.login.$valid) {
            $scope.login.username = $scope.login.password = undefined;
            $scope.authenticated = true;
        }
    }

    $scope.logOut = function() {
        $scope.authenticated = false
    }
});
