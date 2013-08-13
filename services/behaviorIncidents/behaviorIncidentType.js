angular.module('pace').factory('BehaviorIncidentType', function(Backbone, Student) {
    return Backbone.Model.extend({
        /*
            Attibutes:
                id : String
                code : String
                label : String
                supportsDuration : Boolean
                applicableStudent : Student or null
         */
        defaults: {
            supportsDuration: false
        },

        urlRoot: '/pace/behaviortypes/',

        parse: function(response, options) {
            // transform student stub dict into Student model
            response = Backbone.Model.prototype.parse.apply(this, arguments);
            if (response.applicableStudent) {
                response.applicableStudent = new Student(response.applicableStudent);
            }
            return response;
        }
    });
});
