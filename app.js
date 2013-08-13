var app = angular.module('pace', ['ngMobile', 'underscore', 'widgets', 'backbone', 'moment']);

app.controller('main', function ($scope) {
    $scope.login = {};
    $scope.authenticated = true;

    $scope.authenticate = function() {
        if ($scope.login.$valid) {
            $scope.authenticated = true;
        }
    }
});
