angular.module('pace').provider('timeTracker', function() {
    var periodStarts = [
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
    ];

    var anchorOffset = 0;
    this.setAnchorTime = function(date) {
        anchorOffset = new Date() - date;
    };

    var timeTracker = {
        /** Access to the current time stamp and period **/
        getTimestamp: function() {
            return new Date(new Date() - anchorOffset);
        },

        currentPeriod: null,

        /** Utility methods **/
        getPeriodForTime: getPeriodForTime,

        getTimestampAsMoment: function() {
            return moment(timeTracker.getTimestamp());
        }
    };

    this.$get = function(moment, $interval) {
        var updateCurrentPeriod = function() {
            var nowTime = timeTracker.getTimestampAsMoment().format('HH:mm');
            timeTracker.currentPeriodNumber = getPeriodForTime(nowTime);
        };

        // initialize the current period based on the time and keep an eye on it
        updateCurrentPeriod();
        $interval(updateCurrentPeriod, 10000);


        return timeTracker;
    };

    /** Implementation details **/

    /**
     * Returns the given period number that the given time falls in.
     *
     * Note that this function has no concept of end-of-day. Anytime between
     * the beginning of the last period and midnight will return the
     * last period number.
     *
     * @param  {String} time
     * @return {Number} period
     */
    function getPeriodForTime(time) {
        var pd = null;
        for (var i = 0; i < periodStarts.length; i++) {
            if (time >= periodStarts[i]) {
                pd = i+1;
            }
            else {
                break;
            }
        }
        return pd;
    }
});
