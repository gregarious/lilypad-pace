// controller for rules
app.controller('AnalyzeTreatmentReportCtrl', function ($scope, $q, TreatmentReportDataProcessor, _) {
    $scope.statusMessage = "";
    $scope.isDataReady = false;

    $scope.$watch('viewState.selectedStudent', setTreatmentReportForStudent);

    function setTreatmentReportForStudent(student) {
      if (student) {
        // create an array of data processors, one per treatment period, to handle
        // all the data fetching and manipulation
        // TODO: add dates
        var dataProcessors = [
          new TreatmentReportDataProcessor(student, null, null),
          new TreatmentReportDataProcessor(student, null, null)
        ];

        $scope.statusMessage = "Fetching data...";
        $scope.isDataReady = false;
        // TODO: clear out charts?

        // fetch each set of treatment report data, and keep ahold of the promises
        var promises = $q.all(_.map(dataProcessors, function(dataProcessor) {
          return dataProcessor.fetchData();
        }));

        // when all data is loaded, we can finally process it
        promises.then(function() {
          displayData(dataProcessors);
          $scope.isDataReady = true;
        }, function() {
          $scope.statusMessage = "Error fetching data";
        });
      }
    }

    function displayData(treatementReportDataProcessors) {
      /*
        TODO: process all the data! easy!

        The data is in an array of TreatmentReportDataProcessor objects, which is an
        object that holds all data relevant to treatment reports for a particular time
        slice.

        The TreatmentReportDataProcessor class (in treatmentReportDataProcessor.js)
        is not fully fleshed out now: all it does at the moment is fetch the data
        (doesn't even do date filtering yet). But, once the data needed for our
        controller is fleshed out, we can offload a lot of the heavy lifting to this
        class, much like with the RulePointsProcessor.
       */
    }

    function drawPointsVisualization(data) {
        // Behaviors Graph
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
        var chartEl = document.getElementById('behaviors-visualization');
        new google.visualization.LineChart(chartEl).draw(table, chartOptions);
    }

    function drawTimeOutGraph(data) {
      // Time Out Graph
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
      var chartEl = document.getElementById('time-out-visualization');
      new google.visualization.LineChart(chartEl).draw(table, chartOptions);
    }

    function drawOutOfAreaGraph(data) {
      // Out of Area Graph
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
      var chartEl = document.getElementById('out-of-area-visualization');
      new google.visualization.LineChart(chartEl).draw(table, chartOptions);
    }
});