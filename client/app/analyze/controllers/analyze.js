// parent controller for analyze
app.controller('StudentAnalyzeCtrl', function ($scope, $q, analyzeDataSources) {

  $scope.views = [
      {name: 'Rules', url: 'app/analyze/views/rules.html'},
      {name: 'Behavior Log', url: 'app/analyze/views/behaviorLog.html'},
      {name: 'Attendance Records', url: 'app/analyze/views/attendanceLog.html'},
      {name: 'Treatment Report', url: 'app/analyze/views/treatmentReport.html'}
      // {name: 'Treatment Period Manager', url: 'app/analyze/views/treatmentPeriodManager.html'}
  ];

  $scope.hasTreatmentPeriods = false;

  $scope.range = function(n) {

    // This is a hack that assumes that
    // endTX is defaulting to treatmentPeriods.models.length
    if (typeof n === 'undefined'){
      n = ($scope.treatmentPeriods.models.length || 1);
    }

    return new Array(Number(n));
  };

  $scope.$watch('viewState.selectedStudent', setTXPickerForStudent);

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

});