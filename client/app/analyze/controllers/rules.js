// controller for rules
app.controller('AnalyzeRulesCtrl', function ($scope, analyzeDataSources, RulePointsProcessor, moment, _) {
    $scope.statusMessage = '';
    $scope.summaryData = null;
    $scope.records = null;
    $scope.txPeriods = null;

    $scope.$watch('viewState.selectedStudent', setRulesForStudent);
    $scope.$watch('startTX', updateVisualization);
    $scope.$watch('duration', updateVisualization);


    function setRulesForStudent(student) {
      if (student) {
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
      mixpanel.track("Viewing Rules");
    }

    function updateVisualization(){

      // Ensure we have access to our set of points and the set of treatment periods
      if (!$scope.records || !$scope.txPeriods){
        return;
      }
      var filteredCollection = _.clone($scope.records);
      var periods = $scope.txPeriods.models;


      if ($scope.startTX > 0 && $scope.duration > 0){

        // Determine the (string) start and end date
        // by calculating the index in the treatment period array
        // from startTX <select> and duration <select>
        var startIndex = Number($scope.startTX) - 1;
        var endIndex = Number($scope.startTX) + Number($scope.duration) - 2;
        var durationTX = Number($scope.duration)
        if (endIndex >= periods.length){
          endIndex = periods.length - 1;
        }
        var dateStart = periods[startIndex].attributes.dateStart;
        var dateEnd = periods[endIndex].attributes.dateEnd;

        // Our filter, ensuring that we only include points within our date range.
        var withinRange = function(model){
          var date = model.attributes.date;
          return (dateStart <= date && date <= dateEnd);
        };

        // Create the collection and update the page.
        console.log("Filtering chart to dates between " + dateStart + " and " + dateEnd);
        filteredCollection.models = _.filter(filteredCollection.models, withinRange);
        filteredCollection.length = filteredCollection.models.length;
        drawChartFrom(filteredCollection);
        mixpanel.track( "Updated Visualization", {
          "TXs": durationTX,
          "Viz start": dateStart,
          "Viz end": dateEnd
        });
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