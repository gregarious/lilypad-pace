angular.module('pace').factory('AttendanceSpan', function(Backbone) {
    /*
        Attributes:
            id : Number
            student: Student
            timeIn: String (ISO-formatted time)
            timeOut: String (ISO-formatted time)
            date: String (ISO-formatted date)
     */
    return Backbone.Model.extend({
        urlRoot: '/pace/attendancespans/',
        toJSON: function() {
            // camelize the data keys first
            var data = Backbone.Model.prototype.toJSON.apply(this, arguments);

            // need to turn `student` into a primary key
            var student = data['student'];
            if (student && !_.isUndefined(student.id)) {
                data['student'] = student.id;
            }

            return data;
        },
	});
});
