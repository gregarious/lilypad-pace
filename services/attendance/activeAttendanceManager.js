angular.module('pace').service('activeAttendanceManager', function(attendanceDataStore, moment, timeTracker) {
    // TODO: tie the spans in with the Student model
    this.activeSpans = {};      // map from student ids to AttendanceSpan objects (or null)

    /**
     * Create a span for the given user that starts at the current time.
     * @param  {[type]} student [description]
     * @return {[type]}         [description]
     */
    this.activateSpanForStudent = function(student) {
        if (this.activeSpans[student.id]) {
            throw Error('student already has an active attendance span');
        }
        else {
            this.activeSpans[student.id] = attendanceDataStore.createSpan(
                student,
                timeTracker.currentDate,
                moment().format('HH:mm:ss'));
            student.markPresent();
        }
    };

    /**
     * Remove span from activeSpans object and add a `timeOut` value
     * to the span being removed.
     *
     * @param  {Student}} student
     */
    this.deactivateSpanForStudent = function(student) {
        if (this.activeSpans[student.id]) {
            var span = this.activeSpans[student.id];
            span.set('timeOut', moment().format('HH:mm:ss'));
            span.save();
            this.activeSpans[student.id] = null;
            student.markAbsent();
        }
    };

    /**
     * Initializes the activeSpans objects for the given
     * Collection of Student models.
     *
     * @param  {Collection} studentCollection
     */
    this.initializeSpans = function(studentCollection) {
        var activeSpanObj = this.activeSpans;

        // initialize to null for each student
        studentCollection.each(function(student) {
            activeSpanObj[student.id] = null;
            student.set('isPresent', false);
        });

        // get the active spans, and cycle through them to update the sapn object
        var spanCollection = attendanceDataStore.getActiveSpans();
        var updateSpans = function() {
            spanCollection.each(function(span) {
                var student = studentCollection.get(span.get('student').id);
                if (student) {
                    activeSpanObj[student.id] = span;
                    student.set('isPresent', true);
                }
            });
        };

        // TODO: use APIBackedCollection.isSyncInProgress here?
        // if collection is empty, its syncing and we need to update when it's done
        if (spanCollection.isSyncInProgress) {
            spanCollection.once('sync', updateSpans);
        }
        else {
            updateSpans();
        }
    };
});