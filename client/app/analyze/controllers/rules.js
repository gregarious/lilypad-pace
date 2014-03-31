// controller for rules
app.controller('AnalyzeRulesCtrl', function ($scope, analyzeDataSources, RulePointsProcessor, moment, _, $timeout, $q) {
    $scope.statusMessage = '';
    $scope.summaryData = null;

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

    // after rules data is in place, these will be set to functions that will stop watching
    // for treatment period widget input changes (necessary when selected student changes)
    var stopWatchingTxInput;
    var stopWatchingDurationInput;

    // for mixpanel tracking
    $scope.$watch('viewState.selectedTab', reportSwitchToRules);

    function reportSwitchToRules() {
        if ($scope.analyzeView.name === 'Rules' && $scope.viewState.selectedTab === ANALYZE_TAB_INDEX) {
            console.log("Westin, code goes here")
        }
    }

    function setRulesForStudent(student) {
      var rawDataCollections = {};    // this will have two keys upon fetch: 'txPeriods' and 'records'

      if (student) {
        $scope.statusMessage = "Fetching rules data...";
        $scope.summaryData = null;
        // TODO: blank out chart?

        // if we're watching the input widgets, stop until the new data is fetched
        if (stopWatchingTxInput) stopWatchingTxInput();
        if (stopWatchingDurationInput) stopWatchingDurationInput();

        // fetch periodic records and treatment periods
        var fetchingRecords = analyzeDataSources.fetchPeriodicRecords(student);
        var fetchingTx = analyzeDataSources.fetchTreatmentPeriods(student);

        // when both fetches return, we can start creating the visualization
        $q.all({
          records: fetchingRecords,
          txPeriods: fetchingTx
        }).then(function(response) {
          // grab the three pieces of data we need for the visualization
          rawDataCollections = response;
          var origTx = $scope.endTx;
          var origDuration = $scope.duration;

          // do all the legwork to render the graph and summary data
          updateVisualization(rawDataCollections, origTx, origDuration);

          // finally, set up watches on the treatment period/duration widgets (hold onto the unregister
          // functions so we don't set up duplicate watches when selected student changes)
          stopWatchingTxInput = $scope.$watch('endTX', function(newTx) {
            // this check is necessary because Angular always calls the callback on watch creation, which we don't want
            if (origTx !== newTx) {
              origTx = newTx;
              updateVisualization(rawDataCollections, newTx, $scope.duraton);
            }
          });

          stopWatchingDurationInput = $scope.$watch('duration', function(newDuration) {
            // this check is necessary because Angular always calls the callback on watch creation, which we don't want
            if (origDuration !== newDuration) {
              origDuration = newDuration;
              updateVisualization(rawDataCollections, $scope.endTx, newDuration);
            }
          });

          $scope.statusMessage = "";
        }, function(errorReasons) {
          $scope.statusMessage = "Error retrieving rules data";
        });
      }
      else {
        $scope.statusMessage = "No student selected";
      }
    }

    function updateVisualization(rawDataCollections, endTx, duration) {
      var records = rawDataCollections.records;
      var txPeriods = rawDataCollections.txPeriods;
      console.log(records, txPeriods);

      console.log("updating visualization");
      console.log(duration);

      var currentDuration = document.querySelector('#durationInput').value;

      //$scope.$apply();

      var filteredCollection = _.clone(records);
      var periods = txPeriods.models;

      if (typeof currentDuration === 'undefined' || Number(currentDuration) < 1){
        $scope.duration = duration = 1;
      }

      /*
      if (typeof $scope.endTX === 'undefined' || $scope.endTX < 1){
        $scope.endTX = (periods.length || 1);
      }

      if ($scope.endTX < $scope.duration){
        $scope.duration = $scope.endTX;
      }*/

      console.log('[ endTX: ' + endTx + ' , duration: ' + currentDuration + ' ]');

      if (endTx > 0 && currentDuration > 0){

        // Determine the (string) start and end date
        // by calculating the index in the treatment period array
        // from endTX <select> and duration <select>

        // Determine the (index of the) starting treatment period
        var startIndex = Number(endTx) - Number(currentDuration);

        // Determine the (index of the) ending treatment period
        var endIndex = Number(endTx) - 1;

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