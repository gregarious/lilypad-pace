angular.module('pace')

.factory('Student', function(Backbone, apiConfig, AttendanceSpan, BehaviorIncident){
    Backbone.AppModels.Student = Backbone.RelationalModel.extend({
        /*
            Attributes:
                id : Integer
                url : String
                firstName : String
                lastName : String
        */

        urlRoot: apiConfig.toAPIUrl('students/'),
    });

    return Backbone.AppModels.Student;
});
