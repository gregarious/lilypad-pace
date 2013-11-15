angular.module('pace').factory('BehaviorIncident', function(Backbone, moment, LoggableMixin, BehaviorIncidentType, behaviorIncidentTypeDataStore, Student, apiConfig) {
    Backbone.AppModels.BehaviorIncident = Backbone.RelationalModel.extend(_.extend(new LoggableMixin(), {
        /*
            Attributes:
                id : String
                startedAt : Date
                endedAt : Date or null
                student : Object (Student stub)
                comment : String
            Relations:
                type : BehaviorIncidentType
                student : Student
         */

        relations: [
            {
                key: 'type',
                relatedModel: BehaviorIncidentType,
                type: Backbone.HasOne,
                includeInJSON: Backbone.Model.prototype.idAttribute     // only send id back to server
            },
            {
                key: 'student',
                relatedModel: Student,
                type: Backbone.HasOne,
                includeInJSON: Backbone.Model.prototype.idAttribute     // only send id back to server
            }
        ],

        // needed to allow for creating and saving isolated incidents
        urlRoot: apiConfig.toAPIUrl('behaviorincidents/'),

        parse: function(response, options) {
            // do basic parsing and case transformation
            var camelResponse = Backbone.RelationalModel.prototype.parse.apply(this, arguments);

            // parse ISO date string into Date
            camelResponse.startedAt = moment(camelResponse.startedAt).toDate();
            camelResponse.endedAt = response.endedAt && moment(camelResponse.endedAt).toDate();

            return camelResponse;
        },

        toJSON: function() {
            // do basic case transformation
            var data = Backbone.RelationalModel.prototype.toJSON.apply(this);

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
                return this.get('type').get('label');
            }
            return undefined;
        }
    }));

    return Backbone.AppModels.BehaviorIncident;
});
