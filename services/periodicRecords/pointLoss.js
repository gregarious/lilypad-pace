angular.module('pace').factory('PointLoss', function(Backbone) {
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

	return Backbone.Model.extend({
		urlRoot: '/pace/pointlosses/'
	});
});