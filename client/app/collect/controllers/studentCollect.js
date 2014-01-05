// parent controller for collect pane
app.controller('StudentCollectCtrl', function ($scope, dailyDataStore) {
    /** $scope interface **/
    $scope.collectData = null;

    // various local view state properties
    $scope.statusMessage = '';

    // on student changes, reset all of the collect view data
    $scope.$watch('viewState.selectedStudent', resetCollectDataForStudent);

    /** Implementation details **/

    function resetCollectDataForStudent(student) {
        if (student && dailyDataStore.studentData) {
            // need to successfully fetch both records and behavior incidents for today
            $scope.statusMessage = "";
            $scope.collectData = dailyDataStore.studentData[student.id];
        }
        else {
            $scope.collectData = null;
            $scope.statusMessage = 'No student selected';
        }
    }
});