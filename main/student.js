// maintains view state data for main content area for the student view
app.controller('MainStudentCtrl', function($scope, studentService, viewService) {
    $scope.behaviorModalActive = false
    $scope.incidents = [
        {
            occurred_at: new Date('2013-07-02T17:45:23'),
            duration: 15,   // 15 seconds = 15s
            comment: 'Ran out of classroom',
            type: 'Out of Area'
        },
        {
            occurred_at: new Date('2013-07-02T17:22:23'),
            duration: ((60 * 5) + (15)),   // 5 minutes 15 seconds = 5min 15s
            comment: 'Ran out emergency exit',
            type: 'Out of Building'
        },
        {
            occurred_at: new Date('2013-07-02T14:07:23'),
            duration: ((60 * 60 * 3) + 15),   // 3 hour 15 seconds = 1h
            comment: 'Hit another student',
            type: 'Physical Aggression'
        },
        {
            occurred_at: new Date('2013-07-02T13:23:23'),
            duration: null,   // 2 hours 17 minutes 15 seconds = 2h 17min
            comment: '',
            type: 'Suicidal/Homicidal Ideation'
        },
        {
            occurred_at: new Date('2013-07-02T12:05:23'),
            duration: ((60 * 60 * 2) + (17 * 60) + (15)) ,   // 2 hours 17 minutes 15 seconds = 2h 17min
            comment: 'Ran out of classroom',
            type: 'Out of Area'
        }
    ]

    $scope.$watch(function() {return viewService}, function(data) {
        $scope.student = studentService.getStudents().get([data.parameters.id]);
        $scope.attendance = data.parameters.attendance;
    }, true);


    $scope.decrement = function(category) {
        $scope.student[category]--;
    }

    $scope.showSettings = function() {
        $scope.behaviorModalActive = true;
    }
});

app.controller('behaviorModalCtrl', function($scope, studentService, viewService) {
    $scope.addingBehavior = false;
    $scope.behaviorTypes = ['Frequency', 'Duration'];
    $scope.selectedBehaviorType = null;

    $scope.behaviors = studentService.getStudents().get(viewService.parameters.id).get('behaviorIncidentTypes').models;
    console.log(studentService.getStudents().get(viewService.parameters.id).get('behaviorIncidentTypes').models.length);

    $scope.showAddBehavior = function() {
        $scope.addingBehavior = true;
    }

    $scope.hideAddBehavior = function() {
        $scope.addingBehavior = false;
    }

    $scope.saveBehavior = function() {
        console.log($scope.description, $scope.selectedBehaviorType);
        $scope.addingBehavior = false;
    }
});