angular.module('pace').factory('AttendanceSpan', function(Backbone, Student, apiConfig) {
    /*
        Attributes:
            id : Number
            timeIn: String (ISO-formatted time)
            timeOut: String (ISO-formatted time)
            date: String (ISO-formatted date)
        Relations:
            student : Student
     */
    Backbone.AppModels.AttendanceSpan = Backbone.RelationalModel.extend({
        urlRoot: apiConfig.toAPIUrl('attendancespans/'),
        relations: [
            {
                key: 'student',
                relatedModel: Student,
                type: Backbone.HasOne,
                includeInJSON: Backbone.Model.prototype.idAttribute     // only send id back to server
            }
        ]
	});

    return Backbone.AppModels.AttendanceSpan;
});
