angular.module('pace').factory('DiscussionReply', function(Backbone, moment) {
	return Backbone.Model.extend({
        /*
            Note: this model has no API endpoint. Always nested in Post object.

            Attributes:
                author : String (will later be User model)
                createdAt : Date
                content : String
         */
        parse: function(response, options) {
            // only need to handle Date deserialization
            // TODO: handle author deserialization when User model in place; card #47
            response = Backbone.Model.prototype.parse.apply(this, arguments);
            response.createdAt = moment(response.createdAt).toDate();
            return response;
        }
    });
});