angular.module('pace').factory('BehaviorIncidentType', function(Backbone, Student) {
    return Backbone.PersistentModel.extend({
        /*
            Attibutes:
                id : String
                code : String
                label : String
                supportsDuration : Boolean
                applicableStudent : Object (student stub)
         */
        defaults: {
            supportsDuration: false
        },

        urlRoot: '/pace/behaviortypes/',
    });
});
