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
    }
});