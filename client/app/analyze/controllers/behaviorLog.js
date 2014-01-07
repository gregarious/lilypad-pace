// controller for the behavior log
app.controller('AnalyzeBehaviorLogCtrl', function ($scope, logEntryDataStore) {
    $scope.data = {};

    $scope.showBehaviorModal = function() {
        $scope.behaviorModalState.active = true;
    };
    $scope.showBehaviorModal = function() {
        $scope.behaviorModalState.active = false;
    };

    $scope.$watch('viewState.selectedStudent', setBehaviorLogForStudent);

    /**
     * Hooks $scope.behaviorLogCollection up to the given student's data.
     */
    function setBehaviorLogForStudent(student) {
        //if (student) {
        //    // Greg, why is getForStudent method commented out in logEntryDataStore?
        //    $scope.behaviorLogCollection = logEntryDataStore.getForStudent(student);
        //
        //else {
            $scope.behaviorLogCollection = null;
        //}
    }
});