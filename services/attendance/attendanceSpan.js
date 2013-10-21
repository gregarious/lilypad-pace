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
	});
});
