// maintains viewstate for main content area
app.controller('TodayStatusBarCtrl', function ($scope, timeTracker, dailyDataStore, periodSwitcher) {
    $scope.dayLabel = timeTracker.getTimestampAsMoment().format('MMMM D');
    $scope.startDayButton = {
        text: '',
        action: null,
    };

    // hook into data store to give view access to dailyDataStore.hasDayBegun
    $scope.dailyDataStore = dailyDataStore;

    // win the selected classroom changes, update the today status bar
    $scope.$watch('viewState.selectedClassroom', resetStatusBar);

    /**
     * `notifyPeriodChange` is necessary for period switcher to notify us
     * about a period number change (Safari bug $timeout workaround makes
     * this necessary: the switcher could make this change asyncronously).
     *
     * Function simply passes this message along to the root viewState.
     */
    this.notifyPeriodChange = function(periodNumber) {
        $scope.viewState.selectedPeriod = periodNumber;
    };
    $scope.switcher = periodSwitcher;
    $scope.switcher.delegate = this;

    function resetStatusBar(classroom) {
        if (classroom) {
            // configure data store to refer to today's data for given classroom
            dailyDataStore.configure(timeTracker.getDateString(), classroom);

            $scope.startDayButton.text = 'Loading today...';

            var fetchingRecord = dailyDataStore.loadDay(classroom);
            fetchingRecord.then(function() {
                if (dailyDataStore.currentPeriod === null) {
                    $scope.startDayButton.text = "Start Day";
                    $scope.startDayButton.action = function() {startNewDay(classroom);};
                }
                else {
                    $scope.startDayButton.text = "";
                    $scope.startDayButton.action = null;
                    $scope.switcher.reset(dailyDataStore.currentPeriod);
                }
            }, function(err) {
                alert("We're sorry, but there was a problem loading today's data. Please try again. If problem persists, please contact us.");
                $scope.startDayButton.text = "Retry loading";
                $scope.startDayButton.action = function() {resetStatusBar(classroom);};
                $scope.viewState.todayRecord = null;
                $scope.switcher.reset();
            });
        }
        else {
            // clear out today data store
            dailyDataStore.clear();

            $scope.startDayButton = {
                text: '',
                action: null,
            };
            $scope.switcher.reset();
        }
    }

    function startNewDay(classroom) {
        $scope.startDayButton.text = "Starting day...";
        $scope.startDayButton.action = null;

        // we assume the dailyDataStore is already configured to today's date
        var initializingRecord = dailyDataStore.startDay(classroom);
        initializingRecord.then(function() {
            $scope.startDayButton.text = "";
            $scope.startDayButton.action = null;
            $scope.switcher.reset(dailyDataStore.currentPeriod);
        }, function(err) {
            alert("We're sorry, but there was a problem starting a new day. Please try again. If problem persists, please contact us.");
            $scope.startDayButton.text = "Start Day";
            $scope.startDayButton.action = function(){startNewDay(classroom);};
        });
    }
});