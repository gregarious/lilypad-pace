angular.module('pace').service('rulesDataSource', function($q, Backbone, apiConfig, PeriodicRecord, timeTracker, moment, _) {
    this.getDailyRulePointTotals = function(student) {
        var periodicRecordCollection = new (Backbone.Collection.extend({
            model: PeriodicRecord,
            url: apiConfig.toAPIUrl('students/' + student.id + '/periodicrecords/'),
            comparator: 'date'
        }))();

        var deferred = $q.defer();
        periodicRecordCollection.fetch({
            success: function(collection) {
                var totalsData = processRecordsIntoTotals(collection);
                deferred.resolve(totalsData);
            },
            error: function(err) {
                deferred.reject(err);
            }
        });

        return deferred.promise;
    };

    /**
     * Given a collection of PeriodicRecord models, cycles through
     * them and returns an array of objects with the following format:
     * {
     *     date: <String (ISO-formatted date)>,
     *     fd: {
     *         eligible: <Number>
     *         acquired: <Number>
     *     },
     *     cw: {
     *         eligible: <Number>
     *         acquired: <Number>
     *     },
     *     kw: {
     *         eligible: <Number>
     *         acquired: <Number>
     *     },
     *     bs: {
     *         eligible: <Number>
     *         acquired: <Number>
     *     }
     * }
     *
     * @param  {Collection} recordCollection
     * @return {Array}
     */
    function processRecordsIntoTotals(recordCollection) {
        var dateTotalsMap = {};
        var earliestDateString = null;

        recordCollection.each(function(pdRecord) {
            var dateString = pdRecord.get('date');
            // while we're here, keep track the earliest date on record for the student
            if (dateString && (!earliestDateString || dateString < earliestDateString)) {
                earliestDateString = dateString;
            }

            // no points to process if student was ineligible this period
            // TODO: remove this
            if (!pdRecord.get('isEligible')) {
                return;
            }

            var totalsForDate = dateTotalsMap[dateString];

            // if running total doesn't exist for this date yet, start one
            if (!totalsForDate) {
                totalsForDate = dateTotalsMap[dateString] = createTotalsEntry(dateString);
            }

            // cycle through points map and add it to our running total for the date
            var pdPoints = pdRecord.get('points');
            _.each(['fd', 'cw', 'kw', 'bs'], function(pointType) {
                if (_.isNumber(pdPoints[pointType])) {
                    totalsForDate[pointType].eligible += 2;
                    totalsForDate[pointType].acquired += pdPoints[pointType];
                }
            });
        });

        var totalsData = [];

        // cycle through all dates from the first one available to today
        // and if available, extract values from the mapping for the given
        // date, or if not, create a blank entry for the given day
        if (earliestDateString) {
            var currentDate = moment(earliestDateString);
            var now = timeTracker.getTimestampAsMoment();
            while(currentDate <= now) {
                var currentDateString = currentDate.format('YYYY-MM-DD');
                var existingTotals = dateTotalsMap[currentDateString];

                if (existingTotals) {
                    // if totals exist for the given day, simply use them
                    totalsData.push(existingTotals);
                }
                else {
                    // otherwise, create a
                    totalsData.push(createTotalsEntry(currentDateString));
                }

                currentDate.add('days', 1);
            }
        }

        return totalsData;
    }

    function createTotalsEntry(dateString) {
        return {
            dateString: dateString,
            fd: { eligible: 0, acquired: 0 },
            cw: { eligible: 0, acquired: 0 },
            kw: { eligible: 0, acquired: 0 },
            bs: { eligible: 0, acquired: 0 }
        };
    }
});
