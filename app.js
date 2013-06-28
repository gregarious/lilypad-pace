var app = angular.module('pace', ['underscore']);

app.controller('MainCtrl', ['$scope', function(scope) {
    scope.view = null;
}]);

app.directive('menuItem', function() {
    return {
        require: '^menu',
        restrict: 'E',
        transclude: true,
        scope: {href: '@'},
        controller: function($scope, $element) {
            $scope.selectedView = function(href) {
                return window.location.pathname.indexOf(href) > -1;
            }
        },
        template: '<li ng-transclude></li>',

        replace: true
    }
})

app.directive('menu', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function($scope, $element) {

        },
        template: '<ul ng-transclude></ul>',
        replace: true
    }
})

//Save attendance, Cancel attendance?

app.controller('StudentCtrl', ['$scope', function(scope) {
    scope.serverStudents = [
        {
            "_id": "51c89c0b1484e90e5940b021",
            "first_name": "Tom",
            "last_name": "Haverford"
        },
        {
            "_id": "51c89c0b1484e90e5940b022",
            "first_name": "Ann",
            "last_name": "Perkins"
        },
        {
            "_id": "51c89c0b1484e90e5940b023",
            "first_name": "Jerry",
            "last_name": "Gergich"
        },
        {
            "_id": "51c89c0b1484e90e5940b024",
            "first_name": "Donna",
            "last_name": "Meagle"
        },
        {
            "_id": "51c89c0b1484e90e5940b025",
            "first_name": "Andy",
            "last_name": "Dwyer"
        },
        {
            "_id": "51c89c0b1484e90e5940b026",
            "first_name": "Leslie",
            "last_name": "Knope"
        },

        {
            "_id": "51c89c0b1484e90e5940b027",
            "first_name": "April",
            "last_name": "Ludgate"
        },

        {
            "_id": "51c89c0b1484e90e5940b028",
            "first_name": "Ron",
            "last_name": "Swanson"
        }
    ]

    scope.students = {};
    for (var i = 0; i < scope.serverStudents.length; i++) {
        scope.students[scope.serverStudents[i]._id] = scope.serverStudents[i];
    }
}]);