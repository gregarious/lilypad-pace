// controller for the behavior log
app.controller('MainStudentAnalyzeBehaviorLogCtrl', function ($scope, mainViewState) {
    $scope.behaviorLog = $scope.viewState.logViewState.collection.models
    $scope.data = {};
    $scope.data.behaviorModalActive = false;

    $scope.showSettings = function() {
        $scope.data.behaviorModalActive = true;
    }
});