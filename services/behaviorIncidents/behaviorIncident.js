angular.module('pace').factory('BehaviorIncident', function(Backbone, moment, LoggableMixin, BehaviorIncidentType, Student) {
    return Backbone.PersistentModel.extend(_.extend(new LoggableMixin(), {
        /*
            Attributes:
                id : String
                type : BehaviorIncidentType
                startedAt : Date
                endedAt : Date or null
                student : Object (Student stub)
                comment : String
         */

        // needed to allow for creating and saving isolated incidents
        urlRoot: '/pace/behaviorincidents/',

        parse: function(response, options) {
            // do basic parsing and case transformation
            response = Backbone.Model.prototype.parse.apply(this, arguments);

            // parse ISO date string into Date
            response.startedAt = moment(response.startedAt).toDate();
            response.endedAt = response.endedAt && moment(response.endedAt).toDate();

            return response;
        },

        toJSON: function() {
            // do basic case transformation
            var data = Backbone.Model.prototype.toJSON.apply(this);

            // manually transform the dates
            data['started_at'] = moment(this.get('startedAt')).format();
            if (data['ended_at']) {
                data['ended_at'] = moment(this.get('endedAt')).format();
            }
            return data;
        },

        // Loggable mixin overrides
        getOccurredAt: function() {
            return this.get('startedAt');
        },

        // if incident has an end time, returns duration of incident in seconds
        getDuration: function() {
            if (this.has('endedAt')) {
                return (this.get('endedAt') - this.get('startedAt')) / 1000;
            }
            return null;
        },

        getLabel: function() {
            if (this.has('type')) {
                return this.get('type').label;
            }
            return undefined;
        }
    }));
});
