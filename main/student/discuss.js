// maintains view state data for main content area for the student view
app.controller('MainStudentDiscussCtrl', function ($scope, discussionAccessors, viewService) {
    $scope.data = {};
    $scope.$watch(function () {
        return viewService;
    }, function (data) {
        $scope.discussionCollection = discussionAccessors.studentPosts($scope.student);
        $scope.discussions = $scope.discussionCollection.models;
        console.log($scope.discussions);
    }, true);

    $scope.newTopic = function () {
        $scope.discussionCollection.createNewPost($scope.data.content, $scope.data.author);
    };

    $scope.newReply = function (discussion) {
        discussion.createNewReply(discussion.newReply, $scope.data.author);
    };
});

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