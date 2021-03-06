// parent controller for analyze
app.controller('StudentAnalyzeCtrl', function ($scope, $q, analyzeDataSources, behaviorTypeDataStore) {

  $scope.views = [
      {name: 'Rules', url: 'app/analyze/views/rules.html'},
      {name: 'Behavior Log', url: 'app/analyze/views/behaviorLog.html'},
      {name: 'Attendance Records', url: 'app/analyze/views/attendanceLog.html'},
      // {name: 'Treatment Report', url: 'app/analyze/views/treatmentReport.html'},
      {name: 'Treatment Period Manager', url: 'app/analyze/views/treatmentPeriodManager.html'}
  ];

  $scope.hasTreatmentPeriods = false;
  $scope.behaviorTypeCollection = null;
  $scope.overlayedIncident = 'none';

  $scope.range = function(n) {

    // This is a hack that assumes that
    // endTX is defaulting to treatmentPeriods.length (or 1 if there are no Tx)
    if (typeof n === 'undefined'){
      n = $scope.treatmentPeriods ? $scope.treatmentPeriods.length : 1;
    }

    return new Array(Number(n));
  };

  $scope.$watch('viewState.selectedStudent', setTXPickerForStudent);
  $scope.$watch('viewState.selectedStudent', setIncidentsForStudent);

  // Treatment Period Picker
  function setTXPickerForStudent(student) {
    if (student) {
      $scope.hasTreatmentPeriods = false;
      $scope.treatmentPeriods = null;
      analyzeDataSources.fetchTreatmentPeriods(student).then(function(collection) {
        $scope.treatmentPeriods = collection;
        if (collection.models.length > 0){
          console.log("has tx periods");
          $scope.hasTreatmentPeriods = true;
          $scope.endTX = collection.models.length;
          $scope.duration = 1;
        }
      });
    }
  }

  // Incident picker
  function setIncidentsForStudent(student) {
    if (student) {
      $scope.behaviorTypeCollection = behaviorTypeDataStore.getForStudent($scope.viewState.selectedStudent);
    }
  }

});