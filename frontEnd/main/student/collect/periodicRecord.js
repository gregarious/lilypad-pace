//
/**
 * Controller for periodic records
 *
 * $scope variables defined here:
 *     - data: {
 *         selectedPeriodNumber: Number
 *     }
 *     - availablePeriods: [{
 *         label: String
 *         value: Number
 *     }, ...]
 *     - decrement: function(String)
 *     - selectedPeriod: PeriodicRecord
 */

app.controller('MainStudentCollectPeriodicRecordCtrl', function ($scope, mainViewState, periodicRecordDataStore, logEntryDataStore, timeTracker, _) {
    /** $scope initializing  **/

    // Initialize $scope.data.selectedPeriodNumber to be the current period
    // according to the timeTracker
    $scope.data = {
        selectedPeriodNumber: timeTracker.getCurrentPeriod()
    };

    // Initialize $scope.availablePeriods
    setAvailablePeriods(timeTracker.getCurrentPeriod());

    // See bottom of function for $scope.selectedPeriod initialization

    // decrement the current student in the given category
    $scope.decrement = function (category) {
        var pointLossRecord = $scope.selectedPeriod.registerPointLoss(category);
        var student = $scope.selectedPeriod.get('student');

        // TODO: move this logic inside store; card #77
        // var log = logEntryDataStore.getTodayForStudent(student);
        // log.add(pointLossRecord);
    };

    /** Watches on $scope **/

    // watch the select input for changes
    $scope.$watch('data.selectedPeriodNumber', function(val) {
        updateSelectedPeriod();
    });

    // TODO: insert logic to watch for current time/period changes; card #33

    /** Private utilities **/
    function setAvailablePeriods(maxPeriod) {
        if (maxPeriod) {
            $scope.availablePeriods = _.map(_.range(1, maxPeriod+1), function(pd) {
                return {
                    label: 'Period ' + pd,
                    value: pd
                };
            });
        }
        else {
            $scope.availablePeriods = [];
        }
    }

    // Collection to be kept in sync with the currently selected student
    // app-wide. This collection will be consulted when it comes to displaying
    // the selected period.
    var selectedStudentPeriods = null;

    /** Listeners to ensure view stays in sync with mainViewState **/

    mainViewState.on('change:selectedStudent', function(newSelected) {
        setSelectedPeriodsForStudent(newSelected);
    });

    /**
     * Hooks private selectedStudentPeriods variable up to the given
     * student's data. Also cascades this change into $scope.selectedPeriod.
     */
    var setSelectedPeriodsForStudent = function(student) {
        if (selectedStudentPeriods) {
            selectedStudentPeriods.off('sync', updateSelectedPeriod);
        }

        if (student) {
            selectedStudentPeriods = periodicRecordDataStore.getTodayRecordsForStudent(student);
            selectedStudentPeriods.on('sync', updateSelectedPeriod);
        }
        else {
            selectedStudentPeriods = null;
        }

        // update $scope.selectedPeriod to reflect the new student setting
        updateSelectedPeriod();
    };

    /**
     * Hooks $scope.selectedPeriod variable up to the currently selected
     * period number, using the the PeriodicRecord collection previously
     * set in `setSelectedPeriodsForStudent`.
     */
    var updateSelectedPeriod = function() {
        var pd = parseInt($scope.data.selectedPeriodNumber, 10);
        if (selectedStudentPeriods && pd) {
            $scope.selectedPeriod = selectedStudentPeriods.getByPeriod(pd);
        }
        else {
            $scope.selectedPeriod = null;
        }
    };

    // initialize $scope.selectedPeriod
    var selectedStudent = mainViewState.getSelectedStudent();
    setSelectedPeriodsForStudent(selectedStudent);

});
