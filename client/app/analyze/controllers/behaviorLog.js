// controller for the behavior log
app.controller('AnalyzeBehaviorLogCtrl', function ($scope, analyzeDataSources, mixpanel) {
    $scope.behaviorLogCollection = null;
    $scope.statusMessage = '';

    var ANALYZE_TAB_INDEX = 1;
    // when a new student is selected, update the behavior log data only if analyze is selected
    $scope.$watch('viewState.selectedStudent', function(student) {
      if($scope.viewState.selectedTab == ANALYZE_TAB_INDEX) {
        setBehaviorLogForStudent(student);
      }
    });
    // if the analyze tab is selected, update the current student's behavior log data
    $scope.$watch('viewState.selectedTab', function(selectedTab){
      if(selectedTab == ANALYZE_TAB_INDEX) {
        setBehaviorLogForStudent($scope.viewState.selectedStudent);
      }
    });

    /**
     * Hooks $scope.behaviorLogCollection up to the given student's data.
     */
    function setBehaviorLogForStudent(student) {
        $scope.behaviorLogCollection = null;
        mixpanel.track("Viewing Behavior Log");
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
