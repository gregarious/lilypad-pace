angular.module('pace').factory('periodicRecordAccessors', function(Backbone, moment, Student, DailyStudentRecordCollection, $q) {
    // DailyStudentRecordCollection store
    var dailyRecordsStore = {};
    /**
     * Returns a DailyStudentRecordCollection with records for the
     * given student and date.
     *
     * @param  {Student} student
     * @param  {String} dateString    default: today's date as ISO string
     * @param  {String} options       if {refresh: true} in options, a fetch
     *                                will be performed when the collection
     *                                already exists.
     *
     * @return {DailyStudentRecordCollection}
     */
    var dailyStudentRecords = function(student, dateString, options) {
        // use today's day if no date was provided
        dateString = dateString || moment().format('YYYY-MM-DD');
        var refresh = options && options.refresh;

        var cacheKey = student.id + '/' + dateString;

        var recordCollection = dailyRecordsStore[cacheKey];
        if (!recordCollection) {
            recordCollection = new DailyStudentRecordCollection([], {
                student: student,
                dateString: dateString
            });
            refresh = true;
            dailyRecordsStore[cacheKey] = recordCollection;
        }

        var deferred = $q.defer();
        if (refresh) {
            // TODO: revisit the non-destructive nature of the fetch
            recordCollection.fetch({
                remove: false,
                success: function(collection, resp, options) {
                    deferred.resolve(collection);
                },
                error: function(collection, resp, options) {
                    deferred.resolve(resp);
                }
            });
        }
        else {
            deferred.resolve(recordCollection);
        }

        return deferred.promise;
    };

    /** Public interface of service **/

    // expose the student accessor functions
    return {
        dailyStudentRecords: dailyStudentRecords
    };
});
