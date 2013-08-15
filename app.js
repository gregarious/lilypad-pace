var app = angular.module('pace', ['ngMobile', 'underscore', 'widgets', 'backbone', 'moment']);

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
