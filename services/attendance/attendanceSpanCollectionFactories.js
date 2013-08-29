/**
 * Provides factories to create new Collections of AttendanceSpan objects
 */
angular.module('pace').factory('attendanceSpanCollectionFactories', function(APIBackedCollection, AttendanceSpan, moment) {
    return {
        /**
         * Returns a new Collection of AttendanceSpans for a given student
         * in a given date range.
         *
         * @param  {Student} student    (must have `attendanceSpansUrl` defined)
         * @param  {Date} startDate     (ISO-formatted string)
         * @param  {Date} endDate       (ISO-formatted string)
         *
         * @return {Collection instance}
         */
        studentSpans: function(student, startDate, endDate) {
            var rangeArgs = [];
            if (startDate) {
                rangeArgs.push('date__gte=' + moment(startDate).format());
            }
            if (endDate) {
                rangeArgs.push('date__lt=' + moment(endDate).format());
            }

            var AttendanceSpanCollection = APIBackedCollection.extend({
                model: AttendanceSpan,
                url: student.get('attendanceSpansUrl') + (rangeArgs.length ? rangeArgs.join('&') : ''),
                comparator: function(span) {
                    if (span.has('timeIn')) {
                        return -(moment(span.get('date') + 'T' + span.get('timeIn')).toDate());
                    }
                    else {
                        return -(moment(span.get('date')).toDate());
                    }
                }
            });

            return new AttendanceSpanCollection();
        },
    };
});
