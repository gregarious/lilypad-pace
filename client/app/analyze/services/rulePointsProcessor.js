angular.module('pace').factory('RulePointsProcessor', function(timeTracker, moment, _) {
    /**
     * Constructor for object that processes rule data from PeriodicRecords
     * into forms useful for display.
     *
     * @param  {Collection} periodicRecords  Collection of PeriodicRecords
     * @return {RulePointsProcessor}
     */
    return function(periodicRecords) {
        this.pointsData = processRecordsIntoTotals(periodicRecords);
        this.getChartData = function() {
            return toChartData(this.pointsData);
        };
        this.getSummaryData = function() {
            return toSummaryData(this.pointsData);
        };
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
        // in chronological order, and add data from the given day if
        // available. if no data is available, no entry is created
        if (earliestDateString) {
            var currentDate = moment(earliestDateString);
            var now = timeTracker.getTimestampAsMoment();

            while(currentDate <= now) {
                var currentDateString = currentDate.format('YYYY-MM-DD');
                var existingTotals = dateTotalsMap[currentDateString];

                if (existingTotals) {
                    totalsData.push(existingTotals);
                }

                currentDate.add('days', 1);
            }
        }

        return totalsData;
    }

    /**
     * Transforms data into a form friendly for the chart API.
     *
     * @param  {Array} totalsData
     * @return {Array} Contains [date, annotation, fd-value, cw-value, kw-value, bs-value, eligible] arrays
     */
    function toChartData(totalsData) {
      return {
        categories: [
          'Follow Directions',
          'Complete Work',
          'Kind Words',
          'Be Safe'],
        points: _.map(totalsData, function(item) {
          return [
            moment(item.dateString).format('MM/DD'),
            null,   // TODO: add phase lines comments here?
            item.fd.acquired,
            item.cw.acquired,
            item.kw.acquired,
            item.bs.acquired,
            item.bs.eligible    // we just need any type's eligible point total: they should be all the same
          ];
        })
      };
    }

    /**
     * Compile all dates given in the data into single summary statistics
     * (acquired, eligible, percentage) for each point type, as well as
     * totaling up all types into composite statistics.
     */
    function toSummaryData(totalsData) {
      var summaryData = {
        fd: { acquired: 0, eligible: 0 },
        cw: { acquired: 0, eligible: 0 },
        kw: { acquired: 0, eligible: 0 },
        bs: { acquired: 0, eligible: 0 },
        total: { acquired: 0, eligible: 0 }
      };

      // total up all of the dates available in the span
      _.each(totalsData, function(item) {
        summaryData.fd.acquired += item.fd.acquired;
        summaryData.fd.eligible += item.fd.eligible;
        summaryData.cw.acquired += item.cw.acquired;
        summaryData.cw.eligible += item.cw.eligible;
        summaryData.kw.acquired += item.kw.acquired;
        summaryData.kw.eligible += item.kw.eligible;
        summaryData.bs.acquired += item.bs.acquired;
        summaryData.bs.eligible += item.bs.eligible;
      });

      // compile all types into one measure
      summaryData.total.acquired = summaryData.fd.acquired + summaryData.cw.acquired +
                                   summaryData.kw.acquired + summaryData.kw.acquired;
      summaryData.total.eligible = summaryData.fd.eligible + summaryData.cw.eligible +
                                   summaryData.kw.eligible + summaryData.kw.eligible;

      // calculate summary percentages
      summaryData.fd.percentage = Math.round(summaryData.fd.acquired / summaryData.fd.eligible * 100);
      summaryData.cw.percentage = Math.round(summaryData.cw.acquired / summaryData.cw.eligible * 100);
      summaryData.kw.percentage = Math.round(summaryData.kw.acquired / summaryData.kw.eligible * 100);
      summaryData.bs.percentage = Math.round(summaryData.bs.acquired / summaryData.bs.eligible * 100);
      summaryData.total.percentage = Math.round(summaryData.total.acquired / summaryData.total.eligible * 100);

      return summaryData;
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
