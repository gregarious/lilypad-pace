angular.module('pace').factory('AttendanceSpan', function(Backbone, apiConfig) {
    /*
        Attributes:
            id : Number
            timeIn: String (ISO-formatted time)
            timeOut: String (ISO-formatted time)
            date: String (ISO-formatted date)
     */
    Backbone.AppModels.AttendanceSpan = Backbone.RelationalModel.extend({
        urlRoot: apiConfig.toAPIUrl('attendancespans/'),

        relations: [
            {
                key: 'student',
                relatedModel: 'Student',
                type: Backbone.HasOne,
                includeInJSON: Backbone.Model.prototype.idAttribute     // only send id back to server
            }
        ]
	});

    return Backbone.AppModels.AttendanceSpan;
});
