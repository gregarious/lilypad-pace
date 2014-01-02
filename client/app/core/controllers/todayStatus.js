// maintains viewstate for main content area
app.controller('TodayStatusBarCtrl', function ($scope, timeTracker, todayDataManager, periodSwitcher) {
    $scope.dayLabel = timeTracker.getTimestampAsMoment().format('MMMM D');
    $scope.startDayButton = {
        text: '',
        action: null,
    };

    $scope.todayRecord = null;

    $scope.$watch('viewState.selectedClassroom', resetStatusBar);

    $scope.switcher = periodSwitcher;

    function resetStatusBar(classroom) {
        if (classroom) {
            $scope.startDayButton.text = 'Loading today...';

            var fetchingRecord = todayDataManager.fetchTodayRecordForClassroom(classroom);
            fetchingRecord.then(function(record) {
                $scope.todayRecord = record;
                if (record.currentPeriod === null) {
                    $scope.startDayButton.text = "Start Day";
                    $scope.startDayButton.action = function() {startNewDay(classroom);};
                }
                else {
                    $scope.startDayButton.text = "";
                    $scope.startDayButton.action = null;
                    $scope.switcher.reset(record);
                }
            }, function(err) {
                alert("We're sorry, but there was a problem loading today's data. Please try again. If problem persists, please contact us.");
                $scope.startDayButton.text = "Retry loading";
                _g = $scope.startDayButton.action = function() {resetStatusBar(classroom);};
            });
        }
        else {
            $scope.dayStatus = '';
            $scope.buttonText = '';

            $scope.todayRecord = null;
        }
    }

    function startNewDay(classroom) {
        $scope.startDayButton.text = "Starting day...";
        $scope.startDayButton.action = null;

        var initializingRecord = todayDataManager.initializeDayForClassroom(classroom);
        initializingRecord.then(function(record) {
            $scope.startDayButton.text = "";
            $scope.startDayButton.action = null;
        }, function(err) {
            alert("We're sorry, but there was a problem starting a new day. Please try again. If problem persists, please contact us.");
            $scope.startDayButton.text = "Start Day";
            $scope.startDayButton.action = function(){startNewDay(classroom);};
        });
    }
});