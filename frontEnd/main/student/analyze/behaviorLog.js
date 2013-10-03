// controller for the behavior log
app.controller('MainStudentAnalyzeBehaviorLogCtrl', function ($scope, mainViewState, logEntryDataStore) {
    $scope.data = {};

    // set up $scope.behaviorLogCollection
    var selectedStudent = mainViewState.getSelectedStudent();
    setBehaviorLogForStudent(selectedStudent);

    // state object for behavior modal
    $scope.behaviorModalState.active = true;
    $scope.showBehaviorModel = function() {
        $scope.behaviorModalState.active = true;
    };
    $scope.showBehaviorModel = function() {
        $scope.behaviorModalState.active = false;
    };

    /** Listeners to ensure view stays in sync with mainViewState **/
    mainViewState.on('change:selectedStudent', function(newSelected) {
        setBehaviorLogForStudent(newSelected);
    });

    /**
     * Hooks $scope.behaviorLogCollection up to the given student's data.
     */
    function setBehaviorLogForStudent(student) {
        if (student) {
            $scope.behaviorLogCollection = logEntryDataStore.getForStudent(student);
        }
        else {
            $scope.behaviorLogCollection = null;
        }
    }
});