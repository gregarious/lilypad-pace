// controller for the behavior log
app.controller('MainStudentAnalyzeBehaviorLogCtrl', function ($scope, mainViewState, logEntryDataStore) {
    $scope.data = {};

    $scope.showBehaviorModel = function() {
        $scope.behaviorModalState.active = true;
    };
    $scope.showBehaviorModel = function() {
        $scope.behaviorModalState.active = false;
    };

    /** Listeners to ensure view stays in sync with mainViewState **/
    $scope.mainViewState = mainViewState;
    $scope.$watch('mainViewState.selectedStudent', setBehaviorLogForStudent);

    setBehaviorLogForStudent($scope.mainViewState.selectedStudent);

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