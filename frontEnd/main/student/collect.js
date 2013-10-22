// parent controller for collect pane
app.controller('MainStudentCollectCtrl', function ($scope, mainViewState, collectDataStore) {
    /** $scope interface **/
    $scope.collectData = null;

    // various local view state properties
    $scope.statusMessage = '';

    // for purposes of watching the selected student
    $scope.mainViewState = mainViewState;

    // on student changes, reset all of the collect view data
    $scope.$watch('mainViewState.selectedStudent', resetCollectDataForStudent);
    resetCollectDataForStudent(mainViewState.selectedStudent);

    /** Implementation details **/

    function resetCollectDataForStudent(student) {
        if (student) {
            // need to successfully fetch both records and behavior incidents for today
            $scope.statusMessage = "Loading...";
            $scope.collectData = null;
            collectDataStore.loadTodayDataForStudent(student).then(
                function (data) {
                    $scope.collectData = data;
                    $scope.statusMessage = '';
                },
                function (errorMsg) {
                    $scope.collectData = null;
                    $scope.statusMessage = errorMsg;
                }
            );
        }
        else {
            $scope.collectData = null;
            $scope.statusMessage = 'No student selected';
        }
    }
});