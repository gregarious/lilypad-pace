// controller for rules
app.controller('AnalyzeRulesCtrl', function ($scope, analyzeDataSources, RulePointsProcessor, mixpanel, moment, _, $timeout, $q) {
    $scope.statusMessage = '';
    $scope.summaryData = null;
    $scope.records = null;
    $scope.txPeriods = null;
    $scope.hiddenSeries = [];
    $scope.filterState = 'total';

    var ANALYZE_TAB_INDEX = 1;
    // when a new student is selected, update the rules data only if analyze is selected
    $scope.$watch('viewState.selectedStudent', function(student) {
      if($scope.viewState.selectedTab == ANALYZE_TAB_INDEX) {
        setRulesForStudent(student);
      }
    });
    // if the analyze tab is selected, update the current student's rules
    $scope.$watch('viewState.selectedTab', function(selectedTab){
      if(selectedTab == ANALYZE_TAB_INDEX) {
        setRulesForStudent($scope.viewState.selectedStudent);
      }
    });

    $scope.$watch('endTX', function () {
      if ($scope.records) {
        updateVisualization();
      }
    });
    $scope.$watch('duration', function () {
      if ($scope.records) {
        updateVisualization();
      }
    });

    // for mixpanel tracking
    $scope.$watch('viewState.selectedTab', reportSwitchToRules);

    function reportSwitchToRules() {
        if ($scope.analyzeView.name === 'Rules' && $scope.viewState.selectedTab === ANALYZE_TAB_INDEX) {
            mixpanel.track("Viewing Rules");
        }
    }

    function setRulesForStudent(student) {
      $scope.summaryData = null;
      $scope.records = null;
      $scope.txPeriods = null;

      if (student) {
        // Fix data digest bug

        $scope.statusMessage = "Fetching rules data...";
        // TODO: blank out chart?

        var fetchingTx = analyzeDataSources.fetchTreatmentPeriods(student).then(function(collection) {
          $scope.txPeriods = collection;
        });

        var fetchingPdRecords = analyzeDataSources.fetchPeriodicRecords(student).then(function(collection){
            $scope.records = collection;
            drawChartFrom(collection);
        });

        // once both fetches complete, we can update the visualization
        $q.all([fetchingTx, fetchingPdRecords]).then(function(collections) {
            updateVisualization();
            $scope.statusMessage = "";
        }, function(failureReasons) {
            $scope.statusMessage = "Error retrieving rules data";
        });
      }
      else {
        $scope.statusMessage = "No student selected";
      }
    }

    $scope.hideRules = function(rulesToHide, selectedRule) {
      $scope.hiddenSeries = rulesToHide.sort().reverse();
      $scope.filterState = selectedRule;
      updateVisualization();
    };

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

        mixpanel.track( "Updated Visualization", {
            "TXs": currentDuration,
            "Viz start": dateStart,
            "Viz end": dateEnd
        });
      } else {
        console.warn('Invalid end treatment period and duration');
      }
    }

    // Updates the graph and percentage totals.
    function drawChartFrom(collection){
      var pointsProcessor = new RulePointsProcessor(collection);
      $scope.summaryData = pointsProcessor.getSummaryData();
      drawVisualization(pointsProcessor.getChartData());
    }

    function drawVisualization(data) {
        var chartOptions = {
          curveType: "function",
          width: 614,
          height: 270,
          chartArea: {left:50,top:15,width:564,height:200},
          vAxis: {
          title: "Points Retained",
          minValue: 0,
          maxValue: 40 },
          hAxis: {
          title: "Time",
          slantedText: true,
          showTextEvery: 1,
          maxAlternation: 1},
          lineWidth: 3,
          series: [
            {color: '#8A6CAB'},
            {color: '#678FC7'},
            {color: '#f5906c'},
            {color: '#db6464'},
            {color: '#8C8C8C'}],
          annotations: {style: 'line'}
        };

        // Setup table for visualization library
        var table = new google.visualization.DataTable();
        table.addColumn('string', 'x');
        table.addColumn({type: 'string', role: 'annotation'});
        var addNumericColumn = function(name){table.addColumn('number', name);};

        _.map(data.categories, addNumericColumn);
        table.addColumn('number', 'Total Eligible');

        // Add points data: 4 point values and a total eligible value
        table.addRows(data.points);

        chartOptions.hAxis.showTextEvery = Math.ceil(table.getNumberOfRows() / 9);

        // Create data view
        var view = new google.visualization.DataView(table);

        // Col 1 = X Label
        // Col 2 = Follow Directions
        // Col 3 = Complete Work
        // Col 4 = Kind Words
        // Col 5 = Be Safe
        // Col 6 = Total Eligible
        view.hideColumns($scope.hiddenSeries);

        for(var i=0; i<$scope.hiddenSeries.length; i++) {
          chartOptions.series.splice($scope.hiddenSeries[i]-2, 1);
        }

        // Create and draw the visualization.
        var chartEl = document.getElementById('rules-visualization');
        new google.visualization.LineChart(chartEl).draw(view, chartOptions);
    }
});