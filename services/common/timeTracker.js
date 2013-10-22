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
        getTimestamp: function() {
            return new Date(new Date() - anchorOffset);
        },

        getTimestampAsMoment: function() {
            return moment(timeTracker.getTimestamp());
        },

        currentPeriod: null,

        syncPeriodicRecords: syncPeriodicRecords
    };

    this.$get = function(moment) {
        var updateCurrentPeriod = function() {
            var nowTime = timeTracker.getTimestampAsMoment().format('HH:mm');
            timeTracker.currentPeriod = getPeriodForTime(nowTime);
        };

        // TODO: need to add logic to call updateCurrentPeriod periodically; card #81
        updateCurrentPeriod();

        return timeTracker;
    };

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

    /**
     * If student is present, function will cycle through all periods
     * in the active attendance span ensuring that a PeriodicRecord
     * exists for each.
     *
     * If student is absent, will fill in any missing PeriodicRecords
     * between the beginning of the day and now with records with
     * isEligible = false.
     *
     * @param  {Student} student (must support `isPresent` method
     *                   and `activeAttendanceSpan` attribute)
     * @param  {Collection} todayRecordCollection (must support
     *                  `getByPeriod` method)
     */
    function syncPeriodicRecords(student, todayRecordCollection) {
        var activeSpan = student.get('activeAttendanceSpan');
        var iterPd;
        if (activeSpan) {
            iterPd = getPeriodForTime(activeSpan.get('timeIn'));
        }
        else {
            iterPd = 1;
        }
        var lastPd = getPeriodForTime(timeTracker.getTimestampAsMoment().format('HH:mm'));

        while(iterPd <= lastPd) {
            if (!todayRecordCollection.getByPeriod(iterPd)) {
                todayRecordCollection.create({
                    period: iterPd,
                    student: student,
                    isEligible: !!activeSpan
                });
            }
            ++iterPd;
        }
    }
});
