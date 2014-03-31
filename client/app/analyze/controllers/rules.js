// controller for rules
app.controller('AnalyzeRulesCtrl', function ($scope, analyzeDataSources, RulePointsProcessor, moment, _, $timeout) {
    $scope.statusMessage = '';
    $scope.summaryData = null;
    $scope.records = null;
    $scope.txPeriods = null;

    $scope.$watch('viewState.selectedStudent', setRulesForStudent);
    $scope.$watch('endTX', updateVisualization);
    $scope.$watch('duration', updateVisualization);

    function setRulesForStudent(student) {
      if (student) {
        // Fix data digest bug
        // TODO - Call updateVisualization on success, not a timer
        $timeout(updateVisualization, 3000);

        $scope.statusMessage = "Fetching rules data...";
        $scope.summaryData = null;
        $scope.records = null;
        $scope.txPeriods = null;
        // TODO: blank out chart?

        analyzeDataSources.fetchTreatmentPeriods(student).then(function(collection) {
          $scope.txPeriods = collection;
        });

        analyzeDataSources.fetchPeriodicRecords(student).then(function(collection){
            $scope.records = collection;
            drawChartFrom(collection);
            $scope.statusMessage = "";
        },function(response) {
            $scope.statusMessage = "Error retrieving rules data";
        });
      }
      else {
        $scope.statusMessage = "No student selected";
      }
    }

    function updateVisualization() {

      console.log("updating visualization");
      console.log($scope.duration);

      var currentDuration = document.querySelector('#durationInput').value;

      //$scope.$apply();

      // Ensure we have access to our set of points and the set of treatment periods
      if (!$scope.records || !$scope.txPeriods){
        console.warn("Treatment period data hasn't been loaded yet");
        return;
      }
      var filteredCollection = _.clone($scope.records);
      var periods = $scope.txPeriods.models;

      if (typeof currentDuration === 'undefined' || Number(currentDuration) < 1){
        $scope.duration = 1;
      }

      /*
      if (typeof $scope.endTX === 'undefined' || $scope.endTX < 1){
        $scope.endTX = (periods.length || 1);
      }

      if ($scope.endTX < $scope.duration){
        $scope.duration = $scope.endTX;
      }*/

      console.log('[ endTX: ' + $scope.endTX + ' , duration: ' + currentDuration + ' ]');

      if ($scope.endTX > 0 && currentDuration > 0){

        // Determine the (string) start and end date
        // by calculating the index in the treatment period array
        // from endTX <select> and duration <select>

        // Determine the (index of the) starting treatment period
        var startIndex = Number($scope.endTX) - Number(currentDuration);

        // Determine the (index of the) ending treatment period
        var endIndex = Number($scope.endTX) - 1;

        // Assertions
        if (0 > startIndex || startIndex >= periods.length){
          console.warn("Start TX Index out of range");
        }
        if (0 > endIndex || endIndex >= periods.length){
          console.warn("End TX Index out of range");
        }

        // To correct for any mistakes, ensure that our indexes are within range.
        startIndex = (startIndex >= periods.length) ? (periods.length - 1) : startIndex;
        startIndex = (startIndex < 0) ? 0 : startIndex;
        endIndex = (endIndex >= periods.length) ? (periods.length - 1): endIndex;
        endIndex = (endIndex < 0) ? 0 : endIndex;

        // Ensure that our start date is earlier than our end date.
        if (startIndex > endIndex){
          console.warn("Start TX Index exceeds End TX Index");
          var swap = startIndex;
          startIndex = endIndex;
          startIndex = swap;
        }

        var dateStart = periods[startIndex].attributes.dateStart;
        var dateEnd = periods[endIndex].attributes.dateEnd;

        // Our filter, ensuring that we only include points within our date range.
        var withinRange = function(model){
          var date = model.attributes.date;
          return (dateStart <= date && date <= dateEnd);
        };

        // Filter the collection and update the page.
        console.log("Filtering chart to dates between " + dateStart + " and " + dateEnd);
        filteredCollection.models = _.filter(filteredCollection.models, withinRange);
        filteredCollection.length = filteredCollection.models.length;
        drawChartFrom(filteredCollection);

      } else {
        console.warn('Invalid end treatment period and duration');
      }
    }

    // Updates the graph and percentage totals.
    function drawChartFrom(collection){
      var pointsProcessor = new RulePointsProcessor(collection);
      drawVisualization(pointsProcessor.getChartData());
      $scope.summaryData = pointsProcessor.getSummaryData();
    }

    function drawVisualization(data) {
        var chartOptions = {
          curveType: "function",
          width: 614,
          height: 250,
          chartArea: {left:50,top:15,width:564,height:200},
          vAxis: {
          title: "Points Retained",
          maxValue: 20 },
          hAxis: {
          title: "Time",
          maxAlternation: 1},
          lineWidth: 3,
          series: [
            {color: '#DA6666'},
            {color: '#F39070'},
            {color: '#678FC7'},
            {color: '#8A6CAB'}],
          annotations: {style: 'line'}
        };

        // Setup table for visualization library
        var table = new google.visualization.DataTable();
        table.addColumn('string', 'x');
        table.addColumn({type: 'string', role: 'annotation'});
        var addNumericColumn = function(name){table.addColumn('number', name);};
        _.map(data.categories, addNumericColumn);
        table.addRows(data.points);

        // Create and draw the visualization.
        var chartEl = document.getElementById('rules-visualization');
        new google.visualization.LineChart(chartEl).draw(table, chartOptions);
    }
});