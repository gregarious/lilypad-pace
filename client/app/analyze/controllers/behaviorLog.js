// controller for the behavior log
app.controller('AnalyzeBehaviorLogCtrl', function ($scope, analyzeDataSources) {
    $scope.behaviorLogCollection = null;
    $scope.statusMessage = '';
    $scope.$watch('viewState.selectedStudent', setBehaviorLogForStudent);

    /**
     * Hooks $scope.behaviorLogCollection up to the given student's data.
     */
    function setBehaviorLogForStudent(student) {
        $scope.behaviorLogCollection = null;
        if (student) {
            $scope.statusMessage = "Fetching incident logs...";
            analyzeDataSources.fetchIncidentLog(student).then(function(collection) {
                $scope.behaviorLogCollection = collection;
                $scope.statusMessage = collection.length === 0 ?
                    "No attendance records yet logged" :
                    "";
            }, function(responses) {
                $scope.statusMessage = "Error fetching logs";
            });
        }
        else {
            $scope.statusMessage = "No student selected";
        }
    }
});
