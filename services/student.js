angular.module('pace').factory('Student', function(Backbone){
    return Backbone.Model.extend({
        /* 
            Attributes:
                id : Integer
                url : String
                firstName : String 
                lastName : String
                isPresent : Boolean (not part of resource)

                periodicRecordsUrl : String
                behaviorTypesUrl : String
                behaviorIncidentsUrl : String
        */

        defaults: {
            isPresent: false
        },
        urlRoot: '/pace/students/',

        parse: function(request, options) {
            response = Backbone.Model.prototype.parse.apply(this, arguments);

            // TODO: determine isPresent from API data. For now just defaulting to absent
            return response;
        },

        toJSON: function() {
            // camelize the data keys first
            var data = Backbone.Model.prototype.toJSON.apply(this, arguments);

            // don't want to send isPresent or relation urls in requests
            delete data['is_present'];
            delete data['periodic_records_url'];
            delete data['behavior_types_url'];
            delete data['behavior_incidents_url'];
            delete data['posts_url'];

            return data;
        },

        markAbsent: function() {
            // TODO: mark student absent on server
            this.set('isPresent', false);
        },
        markPresent: function() {
            // TODO: mark student present on server
            this.set('isPresent', true);
        }
    });
});