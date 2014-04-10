// controller for rules
app.controller('AnalyzeTreatmentReportCtrl', function ($scope, $q, analyzeDataSources, TreatmentReportDataProcessor, _, mixpanel) {
    $scope.statusMessage = "";

    $scope.$watch('viewState.selectedStudent', setTreatmentReportForStudent);

    function setTreatmentReportForStudent(student) {
      if (student) {
        $scope.statusMessage = "Fetching data...";

        var fetchingTx = analyzeDataSources.fetchTreatmentPeriods(student);
        var fetchingPdRecords = analyzeDataSources.fetchPeriodicRecords(student);

        // once both fetches complete, we can update the visualization
        $q.all([fetchingTx, fetchingPdRecords]).then(function(collections) {
            var txCollection = collections[0];
            var pdRecordCollection = collections[1];
            displayData(txCollection, pdRecordCollection);
            $scope.statusMessage = "";
        }, function(failureReasons) {
            $scope.statusMessage = "Error fetching data";
        });

        mixpanel.track("Viewing Treatment Report");
      }
    }

    function displayData(txCollection, pdRecordCollection) {
      // TODO: use the two input collections to render a treatment report form
    }

    // Old/sample code that might be resurrected if charts are added to the report
    //
    // function drawPointsVisualization(data) {
    //     // Behaviors Graph
    //     var chartOptions = {
    //       curveType: "function",
    //       width: 614,
    //       height: 250,
    //       chartArea: {left:50,top:15,width:564,height:200},
    //       vAxis: {
    //       title: "Points Retained",
    //       maxValue: 20 },
    //       hAxis: {
    //       title: "Time",
    //       maxAlternation: 1},
    //       lineWidth: 3,
    //       series: [
    //         {color: '#DA6666'},
    //         {color: '#F39070'},
    //         {color: '#678FC7'},
    //         {color: '#8A6CAB'}],
    //       annotations: {style: 'line'}
    //     };

    //     // Setup table for visualization library
    //     var table = new google.visualization.DataTable();
    //     table.addColumn('string', 'x');
    //     table.addColumn({type: 'string', role: 'annotation'});
    //     var addNumericColumn = function(name){table.addColumn('number', name);};
    //     _.map(data.categories, addNumericColumn);
    //     table.addRows(data.points);

    //     // Create and draw the visualization.
    //     var chartEl = document.getElementById('behaviors-visualization');
    //     new google.visualization.LineChart(chartEl).draw(table, chartOptions);
    // }

    // function drawTimeOutGraph(data) {
    //   // Time Out Graph
    //   var chartOptions = {
    //     curveType: "function",
    //     width: 614,
    //     height: 250,
    //     chartArea: {left:50,top:15,width:564,height:200},
    //     vAxis: {
    //     title: "Points Retained",
    //     maxValue: 20 },
    //     hAxis: {
    //     title: "Time",
    //     maxAlternation: 1},
    //     lineWidth: 3,
    //     series: [
    //       {color: '#DA6666'},
    //       {color: '#F39070'},
    //       {color: '#678FC7'},
    //       {color: '#8A6CAB'}],
    //     annotations: {style: 'line'}
    //   };

    //   // Setup table for visualization library
    //   var table = new google.visualization.DataTable();
    //   table.addColumn('string', 'x');
    //   table.addColumn({type: 'string', role: 'annotation'});
    //   var addNumericColumn = function(name){table.addColumn('number', name);};
    //   _.map(data.categories, addNumericColumn);
    //   table.addRows(data.points);

    //   // Create and draw the visualization.
    //   var chartEl = document.getElementById('time-out-visualization');
    //   new google.visualization.LineChart(chartEl).draw(table, chartOptions);
    // }

    // function drawOutOfAreaGraph(data) {
    //   // Out of Area Graph
    //   var chartOptions = {
    //     curveType: "function",
    //     width: 614,
    //     height: 250,
    //     chartArea: {left:50,top:15,width:564,height:200},
    //     vAxis: {
    //     title: "Points Retained",
    //     maxValue: 20 },
    //     hAxis: {
    //     title: "Time",
    //     maxAlternation: 1},
    //     lineWidth: 3,
    //     series: [
    //       {color: '#DA6666'},
    //       {color: '#F39070'},
    //       {color: '#678FC7'},
    //       {color: '#8A6CAB'}],
    //     annotations: {style: 'line'}
    //   };

    //   // Setup table for visualization library
    //   var table = new google.visualization.DataTable();
    //   table.addColumn('string', 'x');
    //   table.addColumn({type: 'string', role: 'annotation'});
    //   var addNumericColumn = function(name){table.addColumn('number', name);};
    //   _.map(data.categories, addNumericColumn);
    //   table.addRows(data.points);

    //   // Create and draw the visualization.
    //   var chartEl = document.getElementById('out-of-area-visualization');
    //   new google.visualization.LineChart(chartEl).draw(table, chartOptions);
    // }
});