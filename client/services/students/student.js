angular.module('pace').factory('Student', function(Backbone, timeTracker, AttendanceSpan, apiConfig){
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
        urlRoot: apiConfig.toAPIUrl('students/'),

        initialize: function() {
            var span = this.get('activeAttendanceSpan');
            if (span) {
                // if `activeAttendanceSpan` is a bare object, make it an AttendanceSpan
                if(!span.attributes) {
                    this.set('activeAttendanceSpan', new AttendanceSpan(span));
                }
            }
        },

        // need to deserialze into a new AttendanceSpan instance if applicable
        parse: function(response) {
            camelResponse = Backbone.Model.prototype.parse.apply(this, arguments);
            var spanAttrs = camelResponse.activeAttendanceSpan;
            if (spanAttrs) {
                camelResponse.activeAttendanceSpan = AttendanceSpan.prototype.parse(spanAttrs);
            }
            return camelResponse;
        },

        // need to serialize the AttendanceSpan instance if applicable
        toJSON: function() {
            var data = Backbone.Model.prototype.toJSON.apply(this, arguments);

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
                span.set('timeOut', now.format('HH:mm:ss'));
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

            var now = timeTracker.getTimestampAsMoment();

            // handle this in AttSpan service/store? #refactor
            var newSpan = new AttendanceSpan({
                student: {id: this.id},
                date: now.format('YYYY-MM-DD'),
                timeIn: now.format('HH:mm:ss'),
                timeOut: null
            });
            newSpan.save();

            this.set('activeAttendanceSpan', newSpan);
        }
    });
});
