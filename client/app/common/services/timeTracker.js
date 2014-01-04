/**
 * Manages internal clock of app. Allows overriding the system time
 * at app config to ease development.
 */
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

            getDateString: function() {
                return this.getTimestampAsMoment().format('YYYY-MM-DD');
            }

        };
    };
});
