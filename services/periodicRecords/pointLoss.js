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
            // TODO: handle PeriodicRecord stubbing if necessary (naive impl
            // causes circular reference)

            return response;
        },

		getStudent: function() {
			if (this.has('periodicRecord')) {
				var pdRecord = this.get('periodicRecord');
				if (pdRecord.has('student')) {
					return pdRecord.get('student');
				}
			}
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