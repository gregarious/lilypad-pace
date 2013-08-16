// controller for discussion tab
app.controller('MainStudentDiscussCtrl', function ($scope, discussionAccessors, studentAccessors, viewService) {
    $scope.discussionCollection = null;
    $scope.discussions = [];

    var fetchStudents = studentAccessors.allStudents();
    fetchStudents.then(function(students) {
        $scope.data = {};
        $scope.$watch(function () {
            return viewService;
        }, function (data) {
            $scope.student = students.get([data.parameters.id]);
            var fetchPosts = discussionAccessors.studentPosts($scope.student);
            fetchPosts.then(function(collection) {
                $scope.discussionCollection = collection;
                $scope.discussions = $scope.discussionCollection.models;
            });
        }, true);

        // creating new comments and replies to comments
        // NOTE: parameters are swapped between createNewPost and createNewReply
        $scope.newTopic = function () {
            $scope.discussionCollection.createNewPost($scope.data.content, $scope.data.author);
            console.log($scope.discussionCollection);
        };

        $scope.newReply = function (discussion) {
            discussion.createNewReply($scope.data.author, discussion.newReply);
        };
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