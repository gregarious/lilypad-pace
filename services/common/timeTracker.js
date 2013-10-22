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

    this.$get = function(moment) {
        var timeTracker = {
            getTimestamp: function() {
                return new Date(new Date() - anchorOffset);
            },

            getTimestampAsMoment: function() {
                return moment(timeTracker.getTimestamp());
            },

            currentPeriod: null
        };

        var updateCurrentPeriod = function() {
            var nowTime = timeTracker.getTimestampAsMoment().format('HH:mm');
            var pd = null;
            for (var i = 0; i < periodStarts.length; i++) {
                if (nowTime >= periodStarts[i]) {
                    pd = i+1;
                }
                else {
                    break;
                }
            }

            if(timeTracker.currentPeriod !== pd) {
                timeTracker.currentPeriod = pd;
            }
        };

        // TODO: need to add logic to call updateCurrentPeriod periodically; card #81
        updateCurrentPeriod();

        return timeTracker;
    };

});
