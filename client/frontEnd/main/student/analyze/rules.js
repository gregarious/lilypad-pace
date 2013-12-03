// controller for rules
app.controller('MainStudentAnalyzeRulesCtrl', function ($scope, mainViewState) {
    $scope.data = {};

    /** Listeners to ensure view stays in sync with mainViewState **/
    $scope.mainViewState = mainViewState;
    $scope.$watch('mainViewState.selectedStudent', setRulesForStudent);

    setRulesForStudent($scope.mainViewState.selectedStudent);

    function setRulesForStudent(student) {

      // Fake student data
      var data = {
        categories: [
          'Follow Directions',
          'Complete Work',
          'Kind Words',
          'Be Safe'],
        points: [
          ['10/5', null, 7, 9, 13, 17],
          ['10/6', null, 7, 15, 10, 18],
          ['10/7', null, 8, 18, 9, 18],
          ['10/8', null, 4, 18, 10, 18],
          ['10/9', 'Behavioral Intervention', 2, 16, 11, 20],
          ['10/10', null, 3, 16, 11, 16],
          ['10/11', null, null, null, null, null],
          ['10/12', null, 3, 16, 12, 10],
          ['10/13', 'Medication Change', 1, 17, 13, 20],
          ['10/14', null, 1, 18, 15, 19],
          ['10/15', null, 1, 18, 15, 19]
        ]
      };

      drawVisualization(data);
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