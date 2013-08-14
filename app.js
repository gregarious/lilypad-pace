var app = angular.module('pace', ['ngMobile', 'underscore', 'widgets', 'backbone', 'moment']);

app.controller('main', function ($scope) {
    $scope.login = {};
    $scope.authenticated = true;

    $scope.signIn = function() {
        if ($scope.login.$valid) {
            $scope.authenticated = true;
        }
    }

    $scope.signOut = function() {
        $scope.authenticated = false
    }
});
