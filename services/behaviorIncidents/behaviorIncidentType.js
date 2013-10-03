angular.module('pace').factory('BehaviorIncidentType', function(Backbone, Student) {
    return Backbone.Model.extend({
        /*
            Attibutes:
                id : String
                code : String
                label : String
                supportsDuration : Boolean
                applicableStudent : Object (student stub)
         */
        defaults: {
            supportsDuration: false
        },

        urlRoot: '/pace/behaviortypes/',

        toJSON: function() {
            // stub out the student
            var data = Backbone.Model.prototype.toJSON.apply(this);
            if (data.student) {
                data.student = {
                    id: data.student.id
                };
            }
            return data;
        }
    });
});
