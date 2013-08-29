angular.module('pace').factory('timeTracker', function() {
    var periodStarts = [
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
    ];

    var _currentPeriod = null;

    var updateCurrentPeriod = function() {
        var nowTime = moment(timeTracker.getDateTimestamp()).format('HH:mm');
        var pd = null;
        for (var i = 0; i < periodStarts.length; i++) {
            if (nowTime >= periodStarts[i]) {
                pd = i+1;
            }
            else {
                break;
            }
        };

        if(_currentPeriod !== pd) {
            _currentPeriod = pd;
            timeTracker.trigger('change:currentPeriod', _currentPeriod);
        }
    };

    var timeTracker = {
        getDateTimestamp: function() {
            return moment().toDate();
        },

        getTimeString: function() {
            return moment().format('HH:mm:ss');
        },

        getDateString: function() {
            return moment().format('YYYY-MM-DD');
        },

        getCurrentPeriod: function() {
            return _currentPeriod;
        }
    };

    // add support for event triggering
    _.extend(timeTracker, Backbone.Events);

    // intialize the _currentPeriod value
    updateCurrentPeriod();

    // TODO: need to add logic to call updateCurrentPeriod periodically

    return timeTracker;
});
