angular.module('pace').factory('BehaviorIncident', function(Backbone, moment, LoggableMixin, BehaviorIncidentType, Student) {
    return Backbone.Model.extend(_.extend(new LoggableMixin(), {
        /*
            Attributes:
                id : String
                type : BehaviorIncidentType
                startedAt : Date
                endedAt : Date or null
                student : Student
         */

        // needed to allow for creating and saving isolated incidents
        urlRoot: '/pace/behaviorincidents/',

        parse: function(response, options) {
            // do basic parsing and case transformation
            response = Backbone.Model.prototype.parse.apply(this, arguments);

            // transform student stub dict into Student model and
            // type dict into (full) BehaviorIncidentType model
            response.student = new Student(response.student);
            response.type = new BehaviorIncidentType(response.type);

            // parse ISO date string into Date
            response.startedAt = moment(response.startedAt).toDate();
            response.endedAt = response.endedAt && moment(response.endedAt).toDate();

            return response;
        },

        // Loggable mixin overrides
        getOccurredAt: function() {
            return this.get('startedAt');
        }, 

        getDuration: function() {
            if (this.has('endedAt')) {
                return (this.get('endedAt') - this.get('startedAt')) / 1000;
            }
            return null;
        },

        getLabel: function() {
            if (this.has('type')) {
                return this.get('type').get('label');
            }
            return undefined;
        }


        
    }));
});
