// controller for rules
app.controller('MainStudentAnalyzeRulesCtrl', function ($scope, mainViewState, rulesDataStore, timeTracker, _, moment) {
    $scope.data = {};

    /** Listeners to ensure view stays in sync with mainViewState **/
    $scope.mainViewState = mainViewState;
    $scope.$watch('mainViewState.selectedStudent', setRulesForStudent);

    setRulesForStudent($scope.mainViewState.selectedStudent);

    function setRulesForStudent(student) {
      rulesDataStore.getDailyRulePointTotals(student).then(function(data) {
          var chartData = {
            categories: [
              'Follow Directions',
              'Complete Work',
              'Kind Words',
              'Be Safe'],
            points: packageChartData(data)
          };
          drawVisualization(chartData);
        }, function(err) {
          console.error(err); // TODO: display error state to user
        }
      );
    }

    /**
     * Transforms a data array from a rulesDataStore.getDailyRulePointTotals
     * call into a format friendly for the chart API.
     *
     * If startDate is omitted, all of the date range will be included. If
     * endData is omitted, it defaults to today.
     *
     * @param  {Array} totalsData  (see description)
     * @param  {[type]} startDate  start date to include in range (inclusive) (optional)
     * @param  {[type]} endDate    end date to include in range (inclusive) (optional)
     *
     * @return {Array}
     */
    function packageChartData(totalsData, startDate, endDate) {
      endDate = endDate || timeTracker.getTimestamp();

      var dataInRange;
      if (startDate) {
        dataInRange = _.filter(totalsData, function(data) {
          return data.dateString >= moment(startDate).format('YYYY-MM-DD') &&
                 data.dateString <= moment(endDate).format('YYYY-MM-DD');
        });
      }
      else {
        dataInRange = totalsData;
      }

      return _.map(dataInRange, function(data) {
        return [
          moment(data.dateString).format('MM/DD'),
          null,   // TODO: add phase lines comments here?
          data.fd.actual,
          data.cw.actual,
          data.kw.actual,
          data.bs.actual
        ];
      });
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

        // Compute category totals
        $scope.data.followDirections = { percentage: null, pointsAcquired: null, pointsTotal: null };
        $scope.data.completeWork = { percentage: null, pointsAcquired: null, pointsTotal: null };
        $scope.data.kindWords = { percentage: null, pointsAcquired: null, pointsTotal: null };
        $scope.data.beSafe = { percentage: null, pointsAcquired: null, pointsTotal: null };
        $scope.data.total = { percentage: null, pointsAcquired: null, pointsTotal: null };

        for (var i=0; i<data.points.length; i++) {
          for (var n=0; n<data.points[i].length; n++) {
            if (n == 2) {
              $scope.data.followDirections.pointsAcquired += data.points[i][n];
              $scope.data.followDirections.pointsTotal += 20;
              $scope.data.total.pointsAcquired += data.points[i][n];
              $scope.data.total.pointsTotal += 20;
            } 
            else if (n == 3) {
              $scope.data.completeWork.pointsAcquired += data.points[i][n];
              $scope.data.completeWork.pointsTotal += 20;
              $scope.data.total.pointsAcquired += data.points[i][n];
              $scope.data.total.pointsTotal += 20;
            }
            else if (n == 4) {
              $scope.data.kindWords.pointsAcquired += data.points[i][n];
              $scope.data.kindWords.pointsTotal += 20;
              $scope.data.total.pointsAcquired += data.points[i][n];
              $scope.data.total.pointsTotal += 20;
            }
            else if (n == 5) {
              $scope.data.beSafe.pointsAcquired += data.points[i][n];
              $scope.data.beSafe.pointsTotal += 20;
              $scope.data.total.pointsAcquired += data.points[i][n];
              $scope.data.total.pointsTotal += 20;
            }
          }
        }

        $scope.data.followDirections.percentage = Math.round($scope.data.followDirections.pointsAcquired / $scope.data.followDirections.pointsTotal * 100);
        $scope.data.completeWork.percentage = Math.round($scope.data.completeWork.pointsAcquired / $scope.data.completeWork.pointsTotal * 100);
        $scope.data.kindWords.percentage = Math.round($scope.data.kindWords.pointsAcquired / $scope.data.kindWords.pointsTotal * 100);
        $scope.data.beSafe.percentage = Math.round($scope.data.beSafe.pointsAcquired / $scope.data.beSafe.pointsTotal * 100);
        $scope.data.total.percentage = Math.round($scope.data.total.pointsAcquired / $scope.data.total.pointsTotal * 100);
    }


});