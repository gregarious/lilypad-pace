// controller for the behavior log
app.controller('MainStudentAnalyzeBehaviorLogCtrl', function ($scope, mainViewState) {
    $scope.behaviorLog = $scope.viewState.logViewState.collection.models
});