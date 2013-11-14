angular.module('pace').factory('Student', function(Backbone, AttendanceSpan, apiConfig, timeTracker){
    Backbone.AppModels.Student = Backbone.RelationalModel.extend({
        /*
            Attributes:
                id : Integer
                url : String
                firstName : String
                lastName : String
            Relations:
                activeAttendanceSpan : AttendanceSpan
        */

        defaults: {
            activeAttendanceSpan: null
        },
        urlRoot: apiConfig.toAPIUrl('students/'),

        relations: [
            {
                key: 'activeAttendanceSpan',
                relatedModel: AttendanceSpan,
                type: Backbone.HasOne
            }
        ],

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

    return Backbone.AppModels.Student;
});
