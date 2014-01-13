/**
 * Service to encapsulate all the period switching logic in the TodayStatusBarCtrl
 * controller. Would be better in conjunction with a directive, but this'll do.
 */
angular.module('pace').factory('periodSwitcher', function($timeout) {
    return {
        MAX_PERIOD: 10,
        availablePeriods: [],
        selectedPeriodNumber: null,

        // delegate to notify TodayStatusBarCtrl of period changes
        delegate: null,

        // resets all values based on the given day record
        reset: function(currentPeriod) {
            if (currentPeriod) {
                this.availablePeriods = _.map(_.range(1, currentPeriod+1), function(pdNum) {
                    return {
                        label: 'Period ' + pdNum,
                        value: pdNum
                    };
                });
                this.selectedPeriodNumber = currentPeriod;
            }
            else {
                this.availablePeriods = [];
                this.selectedPeriodNumber = null;
            }

            // notify controller about period change
            if (this.delegate) {
                this.delegate.notifyPeriodChange(this.selectedPeriodNumber);
            }
        },

        // Moves to previous period
        decrementPeriod: function() {
            if (this.selectedPeriodNumber > 1) {
                this.selectedPeriodNumber = this.selectedPeriodNumber - 1;
                // notify controller about period change
                if (this.delegate) {
                    this.delegate.notifyPeriodChange(this.selectedPeriodNumber);
                }
            }
        },

        // Moves to next period
        incrementPeriod: function() {
            // don't do anything if we're on the last period
            if (this.selectedPeriodNumber < this.MAX_PERIOD) {
                var maxAvailablePeriod = _.max(_.pluck(this.availablePeriods, 'value'));
                // if we're on the current period (and not period 10), we need to progress to a new period
                if (this.selectedPeriodNumber === maxAvailablePeriod) {
                    var self = this;
                    // wrap in immediately\\ timeout as a work-around to mobile Safari
                    // double-tap bug (see https://github.com/jquery/jquery-mobile/issues/4686)
                    $timeout(function() {
                        var confirmPointReview = confirm("Are you sure you want to end period " + maxAvailablePeriod + "?");
                        if (confirmPointReview === true) {
                            self.progressToNextPeriod();
                        }
                    }, 0);
                }
                else {
                    this.selectedPeriodNumber = this.selectedPeriodNumber + 1;
                    // notify controller about period change
                    if (this.delegate) {
                        this.delegate.notifyPeriodChange(this.selectedPeriodNumber);
                    }
                }
            }
        },

        progressToNextPeriod: function() {
            var nextPeriodNumber = this.selectedPeriodNumber + 1;
            if (nextPeriodNumber <= this.MAX_PERIOD) {  // sanity check
                this.selectedPeriodNumber = nextPeriodNumber;
                this.availablePeriods.push({
                    label: 'Period ' + nextPeriodNumber,
                    value: nextPeriodNumber
                });
                // notify controller about period change
                if (this.delegate) {
                    this.delegate.notifyPeriodChange(this.selectedPeriodNumber);
                }

                return true;
            }
            return false;
        }
    };
});