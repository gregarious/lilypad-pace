angular.module('pace').factory('PointLoss', function(Backbone, moment, LoggableMixin, apiConfig) {
    /*
		Implements Loggable.

        Attributes:
            id : Integer
            url : String
            pointType : String
            occurredAt : Date
            comment : String
        Relations:
            periodicRecord : PeriodicRecord
    */

	Backbone.AppModels.PointLoss = Backbone.RelationalModel.extend(_.extend(new LoggableMixin(), {
        // relations: [
        //     {
        //         key: 'periodicRecord',
        //         relatedModel: 'PeriodicRecord',
        //         type: Backbone.HasOne,
        //         includeInJSON: Backbone.Model.prototype.idAttribute,    // only send id back to server
        //     }
        // ],

		urlRoot: apiConfig.toAPIUrl('pointlosses/'),

        parse: function(response, options) {
            response = Backbone.RelationalModel.prototype.parse.apply(this, arguments);
            // transform ISO date string to Date
            if (response.occurredAt) {
                response.occurredAt = moment(response.occurredAt).toDate();
            }

            return response;
        },

        toJSON: function() {
            // do basic case transformation
            var data = Backbone.RelationalModel.prototype.toJSON.apply(this);

            // manually transform the dates
            data['started_at'] = moment(this.get('startedAt')).format();

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

    return Backbone.AppModels.PointLoss;
});