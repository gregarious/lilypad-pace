angular.module('pace').factory('AttendanceSpan', function(Backbone, Student) {
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

        parse: function(response, options) {
            // do basic parsing and case transformation
            response = Backbone.Model.prototype.parse.apply(this, arguments);
            // transform student stub dict into Student model
            response.student = new Student(response.student);
            return response;
        }
	});
});
