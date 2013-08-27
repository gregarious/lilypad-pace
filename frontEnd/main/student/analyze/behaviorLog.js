// controller for the behavior log
app.controller('MainStudentAnalyzeBehaviorLogCtrl', function ($scope, mainViewState, logEntryStore) {
    $scope.data = {};

    // set up $scope.behaviorLogCollection
    var selectedStudent = mainViewState.getSelectedStudent();
    setBehaviorLogForStudent(selectedStudent);

    $scope.showSettings = function() {
        $scope.data.behaviorModalActive = true;
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
            $scope.behaviorLogCollection = logEntryStore.getForStudent(student);
        }
        else {
            $scope.behaviorLogCollection = null;
        }
    }
});