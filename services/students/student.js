angular.module('pace').factory('Student', function(Backbone, timeTracker, $injector){
    return Backbone.Model.extend({
        /*
            Attributes:
                id : Integer
                url : String
                firstName : String
                lastName : String
                activeAttendanceSpan : AttendanceSpan or null
                periodicRecordsUrl : String
                behaviorTypesUrl : String
                behaviorIncidentsUrl : String
                postsUrl : String
                attendanceSpansUrl : String
                pointLossesUrl : String
        */

        defaults: {
            activeAttendanceSpan: null
        },
        urlRoot: '/pace/students/',

        parse: function(response) {
            // need to get the AttendanceSpan type from the $injector
            // manually: it causes circular dep otherwise
            var AttendanceSpan = $injector.get('AttendanceSpan');

            response = Backbone.Model.prototype.parse.apply(this, arguments);
            if (response.activeAttendanceSpan) {
                response.activeAttendanceSpan = new AttendanceSpan(response.activeAttendanceSpan);
            }
            return response;
        },

        toJSON: function() {
            // camelize the data keys first
            var data = Backbone.Model.prototype.toJSON.apply(this, arguments);

            // don't want to send relation urls in requests
            delete data['periodic_records_url'];
            delete data['behavior_types_url'];
            delete data['behavior_incidents_url'];
            delete data['posts_url'];
            delete data['attendance_spans_url'];
            delete data['point_losses_url'];

            // also don't bother with this, it's read-only
            delete data['active_attendance_span'];

            return data;
        },

        isPresent: function() {
            return this.has('activeAttendanceSpan');
        },

        markAbsent: function() {
            // mark the student absent by setting the `timeOut` attribute
            // on the `activeAttendanceSpan`, and then removing it
            // completely from this model
            var span = this.get('activeAttendanceSpan');
            if (span) {
                var now = timeTracker.getTimestampAsMoment();
                span.set('timeOut', now.format('YYYY-MM-DD'));
                span.save();
                this.set('activeAttendanceSpan', null);
            }
        },

        markPresent: function() {
            // mark the student present by creating a new
            // `activeAttendanceSpan` and POSTing it
            if (this.has('activeAttendanceSpan')) {
                throw Error('student already has an active attendance span');
            }

            // need to get the attendanceDataStore from the $injector
            // manually: it causes circular dep otherwise
            var attendanceDataStore = $injector.get('attendanceDataStore');

            var now = timeTracker.getTimestampAsMoment();
            var newSpan = attendanceDataStore.createSpan(
                this,
                now.format('YYYY-MM-DD'),
                now.format('HH:mm:ss')
            );
            this.set('activeAttendanceSpan', newSpan);
        }
    });
});