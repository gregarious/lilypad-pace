// maintains viewstate for main content area
app.controller('PeriodSwitchCtrl', function ($scope, timeTracker) {
    $scope.availablePeriods = _.map([1,2,3,4,5,6,7,8,9,10], function(pdNum) {
        return {
            label: 'Period ' + pdNum,
            value: pdNum
        };
    });
    $scope.selectedPeriodNumber = 4;
});
