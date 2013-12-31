angular.module('pace').factory('BehaviorIncidentType', function(Backbone, apiConfig) {
    Backbone.AppModels.BehaviorIncidentType = Backbone.RelationalModel.extend({
        /*
            Attibutes:
                id : String
                code : String
                label : String
                supportsDuration : Boolean
            Relations:
                applicableStudent : Student
         */
        relations: [
            {
                key: 'applicableStudent',
                relatedModel: 'Student',
                type: Backbone.HasOne,
                includeInJSON: Backbone.Model.prototype.idAttribute     // only send id back to server
            }
        ],

        defaults: {
            supportsDuration: false
        },

        urlRoot: apiConfig.toAPIUrl('behaviortypes/'),
    });

    return Backbone.AppModels.BehaviorIncidentType;
});
