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

        // temporarily enabled (card #130)
        toJSON: function() {
            data = Backbone.RelationalModel.prototype.toJSON.apply(this);
            if (data.student) {
                data.student = data.student.id;
            }
            return data;
        }
	});

    return Backbone.AppModels.AttendanceSpan;
});
