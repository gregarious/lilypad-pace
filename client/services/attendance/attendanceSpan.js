angular.module('pace').factory('AttendanceSpan', function(Backbone, apiConfig) {
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
                relatedModel: 'Student',   // can't use actual object, would cause circular dependency,
                type: Backbone.HasOne,
                includeInJSON: Backbone.Model.prototype.idAttribute     // only send id back to server
            }
        ]
	});

    return Backbone.AppModels.AttendanceSpan;
});
