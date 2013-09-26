angular.module('pace').factory('Student', function(Backbone, timeTracker, $injector){
    return Backbone.PersistentModel.extend({
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

        // need to deserialze into a new AttendanceSpan instance if applicable
        parse: function(response) {
            response = Backbone.PersistentModel.prototype.parse.apply(this, arguments);
            if (response.activeAttendanceSpan) {
                var AttendanceSpan = $injector.get('AttendanceSpan');
                response.activeAttendanceSpan = new AttendanceSpan(response.activeAttendanceSpan);
            }
            return response;
        },

        // need to serialize the AttendanceSpan instance if applicable
        toJSON: function() {
            var data = Backbone.PersistentModel.prototype.toJSON.apply(this, arguments);

            // manually replace whatever toJSON did with activeAttendanceSpan
            if (this.get('activeAttendanceSpan')) {
                var attendanceSpanJSON = this.get('activeAttendanceSpan').toJSON();
                data['active_attendance_span'] = attendanceSpanJSON;
            }

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

                // local save the new attendance span value (no need remote sync:
                // the student's active span attribute is read-only on server)
                this.localSave();
            }
        },

        markPresent: function() {
            // mark the student present by creating a new
            // `activeAttendanceSpan` and POSTing it
            if (this.has('activeAttendanceSpan')) {
                throw Error('student already has an active attendance span');
            }

            // need to get it from the $injector
            // manually: it causes circular dep otherwise
            var AttendanceSpan = $injector.get('AttendanceSpan');

            var now = timeTracker.getTimestampAsMoment();

            // TODO: handle this in AttSpan services
            var newSpan = new AttendanceSpan({
                student: {id: this.id},
                date: now.format('YYYY-MM-DD'),
                timeIn: now.format('HH:mm:ss'),
                timeOut: null
            });
            newSpan.save();

            this.set('activeAttendanceSpan', newSpan);

            // local save the new attendance span value (no need remote sync:
            // the student's active span attribute is read-only on server)
            this.localSave();
        }
    });
});