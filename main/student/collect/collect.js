// parent controller for collect pane
app.controller('MainStudentCollectCtrl', function ($scope) {
    $scope.data = {};
    $scope.data.behaviorModalActive = false;

    // shows the settings modal
    $scope.showSettings = function () {
        $scope.data.behaviorModalActive = true;
    };
});