// controller for rules
app.controller('AnalyzeRulesCtrl', function ($scope, rulesDataStore, timeTracker, _, moment) {
    $scope.data = {};

    $scope.$watch('viewState.selectedStudent', setRulesForStudent);

    function setRulesForStudent(student) {
      if (student) {
        rulesDataStore.getDailyRulePointTotals(student).then(function(data) {
            // filter and transform raw data (nothing being done here yet)
            data = processRulesData(data);

            // configure and draw the chart
            var chartData = {
              categories: [
                'Follow Directions',
                'Complete Work',
                'Kind Words',
                'Be Safe'],
              points: packageChartData(data)
            };
            drawVisualization(chartData);

            $scope.summaryData = createSpanSummary(data);
          }, function(err) {
            console.error(err); // TODO: display error state to user
          }
        );
      }
    }

    /**
     * Responsible for transforming raw data from the rulesDataStore
     * to displayable data. Duties include:
     * - date-filtering the data
     *
     * If startDate is omitted, all of the date range will be included. If
     * endData is omitted, it defaults to today.
     *
     * @param  {Array} totalsData        data from a `rulesDataStore.getDailyRulePointTotals` call
     * @param  {Date/String} startDate   start date to include in range (inclusive) (optional)
     * @param  {Date/String} endDate     end date to include in range (inclusive) (optional)
     *
     * @return {Array}             [description]
     */
    function processRulesData(totalsData, startDate, endDate) {
      endDate = endDate || timeTracker.getTimestamp();

      if (startDate) {
        totalsData = _.filter(totalsData, function(data) {
          return data.dateString >= moment(startDate).format('YYYY-MM-DD') &&
                 data.dateString <= moment(endDate).format('YYYY-MM-DD');
        });
      }

      return totalsData;
    }

    /**
     * Transforms data into a form friendly for the chart API.
     *
     * @param  {Array} totalsData
     * @return {Array} Contains [date, annotation, fd-value, cw-value, kw-value, bs-value] arrays
     */
    function packageChartData(totalsData) {
      return _.map(totalsData, function(item) {
        return [
          moment(item.dateString).format('MM/DD'),
          null,   // TODO: add phase lines comments here?
          item.fd.acquired,
          item.cw.acquired,
          item.kw.acquired,
          item.bs.acquired
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

    /**
     * Compile all dates given in the data into single summary statistics
     * (acquired, eligible, percentage) for each point type, as well as
     * totaling up all types into composite statistics.
     */
    function createSpanSummary(data) {
      var summaryData = {
        fd: { acquired: 0, eligible: 0 },
        cw: { acquired: 0, eligible: 0 },
        kw: { acquired: 0, eligible: 0 },
        bs: { acquired: 0, eligible: 0 },
        total: { acquired: 0, eligible: 0 }
      };

      // total up all of the dates available in the span
      _.each(data, function(item) {
        summaryData.fd.acquired += item.fd.acquired;
        summaryData.fd.eligible += item.fd.eligible;
        summaryData.cw.acquired += item.cw.acquired;
        summaryData.cw.eligible += item.cw.eligible;
        summaryData.kw.acquired += item.kw.acquired;
        summaryData.kw.eligible += item.kw.eligible;
        summaryData.bs.acquired += item.bs.acquired;
        summaryData.bs.eligible += item.bs.eligible;
      });

      // compile all types into one measure
      summaryData.total.acquired = summaryData.fd.acquired + summaryData.cw.acquired +
                                   summaryData.kw.acquired + summaryData.kw.acquired;
      summaryData.total.eligible = summaryData.fd.eligible + summaryData.cw.eligible +
                                   summaryData.kw.eligible + summaryData.kw.eligible;

      // calculate summary percentages
      summaryData.fd.percentage = Math.round(summaryData.fd.acquired / summaryData.fd.eligible * 100);
      summaryData.cw.percentage = Math.round(summaryData.cw.acquired / summaryData.cw.eligible * 100);
      summaryData.kw.percentage = Math.round(summaryData.kw.acquired / summaryData.kw.eligible * 100);
      summaryData.bs.percentage = Math.round(summaryData.bs.acquired / summaryData.bs.eligible * 100);
      summaryData.total.percentage = Math.round(summaryData.total.acquired / summaryData.total.eligible * 100);

      return summaryData;
    }
});