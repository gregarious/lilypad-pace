angular.module('pace').factory('BehaviorIncident', function(Backbone, moment, LoggableMixin, BehaviorIncidentType, behaviorIncidentTypeDataStore, Student) {
    return Backbone.Model.extend(_.extend(new LoggableMixin(), {
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

        initialize: function() {
            // assert type subresource is a plain old js object
            var type = this.get('type');
            if (type && type.id) {
                // need to assign the `type` attribute a store registry-based model
                var registeredType = behaviorIncidentTypeDataStore.findOrRegister(type,
                    {merge: true});
                this.set('type', registeredType);
            }
        },

        parse: function(response, options) {
            // do basic parsing and case transformation
            var camelResponse = Backbone.Model.prototype.parse.apply(this, arguments);

            // parse ISO date string into Date
            camelResponse.startedAt = moment(camelResponse.startedAt).toDate();
            camelResponse.endedAt = response.endedAt && moment(camelResponse.endedAt).toDate();

            // transform case for embedded point loss attributes
            if (camelResponse.type) {
                camelResponse.type = BehaviorIncidentType.prototype.parse(camelResponse.type);
            }

            return camelResponse;
        },

        toJSON: function() {
            // do basic case transformation
            var data = Backbone.Model.prototype.toJSON.apply(this);

            // manually transform the dates
            data['started_at'] = moment(this.get('startedAt')).format();
            if (data['ended_at']) {
                data['ended_at'] = moment(this.get('endedAt')).format();
            }

            // type is just a plan old JS object, `parse` does nothing to the API subresource
            data['type'] = _.clone(this.get('type'));

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
});
