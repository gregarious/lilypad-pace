// controller for rules
app.controller('AnalyzeRulesCtrl', function ($scope, analyzeDataSources, RulePointsProcessor, moment, _) {
    $scope.statusMessage = '';
    $scope.summaryData = null;

    $scope.$watch('viewState.selectedStudent', setRulesForStudent);

    function setRulesForStudent(student) {
      if (student) {
        $scope.statusMessage = "Fetching rules data...";
        $scope.summaryData = null;
        // TODO: blank out chart?

        analyzeDataSources.fetchPeriodicRecords(student).then(function(collection) {
            var pointsProcessor = new RulePointsProcessor(collection);
            drawVisualization(pointsProcessor.getChartData());
            $scope.summaryData = pointsProcessor.getSummaryData();
          }, function(response) {
            $scope.statusMessage = "Error retrieving rules data";
          });
      }
      else {
        $scope.statusMessage = "No student selected";
      }
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