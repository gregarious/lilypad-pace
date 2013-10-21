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

            // need to turn `periodic_record` into a stub if it's a model
            if (data['periodic_record'].attributes) {
                data['periodic_record'] = {id: data['periodic_record'].id};
            }

            return data;
        },

		getStudent: function() {
            // TODO: this is broken since periodicRecord is just a shallow POJO
            //  Need to use new store to get the full resource
			return null;
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