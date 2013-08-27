// controller for discussion tab
app.controller('MainStudentDiscussCtrl', function ($scope, mainViewState, discussionPostStore) {
    $scope.data = {};

    // set up the discussionCollection
    var selectedStudent = mainViewState.getSelectedStudent();
    if (selectedStudent) {
        $scope.discussionCollection = discussionPostStore.getForStudent(selectedStudent);
    }
    else {
        $scope.discussionCollection = null;
    }

    // creating new comments and replies to comments
    $scope.newTopic = function () {
        $scope.discussionCollection.createNewPost($scope.data.content, $scope.data.author);
    };

    $scope.newReply = function (discussion) {
        discussion.createNewReply(discussion.newReply, $scope.data.author);
    };

    /** Listeners to ensure view stays in sync with mainViewState **/

    // listen for the selected student to change
    mainViewState.on('change:selectedStudent', function(newSelected) {
        $scope.discussionCollection = discussionPostStore.getForStudent(newSelected);
    });
});

// directive for add reply toggle
app.directive('reply', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {text: '@'},
        controller: function ($scope) {
            $scope.active = false;
            $scope.add = function () {
                $scope.active = true;
            };
            $scope.cancel = function () {
                $scope.active = false;
            };
        },
        template: '<div>' +
            '<div class="input" ng-hide="active" ng-click="add()">{{text}}</div>' +
            '<div ng-show="active" ng-transclude></div>' +
            '</div>',
        replace: true
    };
});