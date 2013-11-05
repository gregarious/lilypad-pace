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

            // need to turn `applicable_student` into a primary key
            var student = data['applicable_student'];
            if (student && !_.isUndefined(student.id)) {
                data['applicable_student'] = student.id;
            }
            return data;
        }
    });
});
