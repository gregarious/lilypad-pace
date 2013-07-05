var app = angular.module('pace', ['underscore']);

// maintains viewstate for main content area
app.controller('MainCtrl', function($scope, viewService) {
    $scope.$watch(function() {return viewService}, function(data) {
        $scope.view = data.currentView; // the current view
        $scope.attendance = data.parameters.attendance; // whether attendance is being taken
    }, true);
});

// will maintain viewstate for menu area
app.controller('MenuCtrl', function($scope) {

});

// maintains viewstate data for student list in menu, handles events (not ideal)
app.controller('MenuStudentListCtrl', function($scope, students, viewService) {
    $scope.students = students.students; // list of students in class

    $scope.$watch(function() {return viewService}, function(data) {
        if (data.parameters._id !== undefined) {
            $scope.currentStudentId = students.students[data.parameters._id]._id; // selected student id
        }
        $scope.attendance = data.parameters.attendance; // whether attendance is being taken
    }, true);

    // toggles attendance controls
    $scope.toggleAttendance = function() {
        viewService.parameters.attendance = !viewService.parameters.attendance;
    };

    // handles click events on student list
    $scope.handleClick = function(studentId) {
        // are we taking attendance or switching main content views between students?
        if ($scope.attendance) {
            students.students[studentId].present = !students.students[studentId].present;
        } else {
            viewService.currentView = 'student';
            viewService.parameters['_id'] = studentId;
        }
    }
});

// maintains view state data for main content area for the student view
app.controller('MainStudentCtrl', function($scope, students, viewService) {
    $scope.settingsActive = false

    $scope.$watch(function() {return viewService}, function(data) {
        $scope.student = students.students[data.parameters._id];
        $scope.attendance = data.parameters.attendance;
    }, true);

    $scope.showSettings = function() {
        $scope.settingsActive = true;
    }

    $scope.hideSettings = function() {
        $scope.settingsActive = false;
    }
});

app.directive('menu', function() {
    return {
        restrict: 'E',
        transclude: true,
        template: '<ul ng-transclude></ul>',
        replace: true
    }
});

app.directive('menuItem', function() {
    return {
        require: '^menu',
        restrict: 'E',
        transclude: true,
        template: '<li ng-transclude></li>',
        replace: true
    }
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
            '<div class="tab-pane" ng-class="{active: selected, disabled: disabled}" ng-transclude>' +
                '</div>',
        replace: true
    };
})

app.directive('mainModal', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {active: '='},
        template:
            '<div class="mainModal modal" ng-class="{active: active}" ng-transclude></div>',
        replace: true
    }
})


// maintains shared viewstate
app.service('viewService', function() {
    return {
        data_view: null,
        get currentView() {return this.data_view},
        set currentView(newView) {
            // if the view has changed, old parameters are irrelevant
            if (this.data_view !== newView) {
                this.data_view = newView;
                this.parameters = {};
            }
        },
        parameters: {},
        disabled: false
    };
});


// placeholder student service
app.service('students', function() {
    this.serverStudents = [
        {
            "_id": "51c89c0b1484e90e5940b021",
            present: false,
            "first_name": "Tom",
            "last_name": "Haverford"
        },
        {
            "_id": "51c89c0b1484e90e5940b022",
            present: true,
            "first_name": "Ann",
            "last_name": "Perkins"
        },
        {
            "_id": "51c89c0b1484e90e5940b023",
            present: true,
            "first_name": "Jerry",
            "last_name": "Gergich"
        },
        {
            "_id": "51c89c0b1484e90e5940b024",
            present: false,
            "first_name": "Donna",
            "last_name": "Meagle"
        },
        {
            "_id": "51c89c0b1484e90e5940b025",
            present: true,
            "first_name": "Andy",
            "last_name": "Dwyer"
        },
        {
            "_id": "51c89c0b1484e90e5940b026",
            present: true,
            "first_name": "Leslie",
            "last_name": "Knope"
        },

        {
            "_id": "51c89c0b1484e90e5940b027",
            present: true,
            "first_name": "April",
            "last_name": "Ludgate"
        },

        {
            "_id": "51c89c0b1484e90e5940b028",
            present: true,
            "first_name": "Ron",
            "last_name": "Swanson"
        }
    ];

    this.students = {};
    for (var i = 0; i < this.serverStudents.length; i++) {
        this.students[this.serverStudents[i]._id] = this.serverStudents[i];
    }
});