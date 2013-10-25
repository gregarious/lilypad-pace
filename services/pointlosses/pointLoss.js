angular.module('pace').factory('PointLoss', function(Backbone, moment, LoggableMixin) {
    /*
		Implements Loggable.

        Attributes:
            id : Integer
            url : String
            periodicRecord : PeriodicRecord
            pointType : String
            occurredAt : Date
            comment : String
    */

	return Backbone.Model.extend(_.extend(new LoggableMixin(), {
		urlRoot: '/pace/pointlosses/',

        parse: function(response, options) {
            response = Backbone.Model.prototype.parse.apply(this, arguments);
            // transform ISO date string to Date
            if (response.occurredAt) {
                response.occurredAt = moment(response.occurredAt).toDate();
            }

            return response;
        },

        toJSON: function() {
            // do basic case transformation
            var data = Backbone.Model.prototype.toJSON.apply(this);

            // manually transform the dates
            data['started_at'] = moment(this.get('startedAt')).format();

            // need to turn `periodic_record` into a primary key
            var pdRecord = data['periodic_record'];
            if (pdRecord && !_.isUndefined(pdRecord.id)) {
                data['periodic_record'] = pdRecord.id;
            }

            return data;
        },

		getDuration: function() {
			return null;
		},

		getLabel: function() {
			var pointType = this.get('pointType');
			var typeDescription = null;

			switch (pointType.toLowerCase()) {
				case 'kw':
					typeDescription = 'Kind Words';
					break;
				case 'cw':
					typeDescription = 'Complete Work';
					break;
				case 'fd':
					typeDescription = 'Follow Directions';
					break;
				case 'bs':
					typeDescription = 'Be Safe';
					break;
				default:
					break;
			}

			if (typeDescription) {
				return "'" + typeDescription + "' Point Loss";
			}

			return "";
		}
	}));
});