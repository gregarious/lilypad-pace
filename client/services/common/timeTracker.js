angular.module('pace').provider('timeTracker', function(moment) {
    var anchorOffset = 0;
    this.setAnchorTime = function(date) {
        anchorOffset = new Date() - date;
    };

    this.$get = function(moment) {
        return {
            /** Access to the current time stamp and period **/
            getTimestamp: function() {
                return new Date(new Date() - anchorOffset);
            },

            getTimestampAsMoment: function() {
                return moment(this.getTimestamp());
            },

            currentPeriodNumber: 1,
            finalPeriodNumber: 10,

            /**
             * Increment the current period as long as it does not go
             * over the finalPeriodNumber value.
             *
             * Returns true if period was incremented, false otherwise.
             */
            progressToNextPeriod: function() {
                var nextPeriodNumber = this.currentPeriodNumber + 1;
                if (nextPeriodNumber <= this.finalPeriodNumber) {
                    this.currentPeriodNumber = nextPeriodNumber;
                    return true;
                }
                return false;
            }
        };
    };
});
