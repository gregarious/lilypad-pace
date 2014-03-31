angular.module('pace').factory('TreatmentPeriod', function(Backbone, apiConfig) {
    /*
        Attributes:
            id : Number
            dateStart: String (ISO-formatted date)
            dateEnd: String (ISO-formatted date)
            student: Student
     */
    Backbone.AppModels.TreatmentPeriod = Backbone.RelationalModel.extend({
        urlRoot: apiConfig.toAPIUrl('treatmentperiods/'),

        relations: [
            {
                key: 'student',
                relatedModel: 'Student',
                type: Backbone.HasOne,
                includeInJSON: Backbone.Model.prototype.idAttribute     // only send id back to server
            }
        ]
    });

    return Backbone.AppModels.TreatmentPeriod;
});
