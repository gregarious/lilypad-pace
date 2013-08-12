angular.module('pace').factory('StudentBehaviorTypeCollection', function(BehaviorIncidentType) {
    return Backbone.Collection.extend({
        model: BehaviorIncidentType,

        initialize: function(models, options) {
            options = options || {};
            if (!options.student) {
                throw new Error("Constructor must be called with `student` in options hash");
            }
            this._student = options.student;
        },

        url: function() {
            return this._student.get('behaviorTypesUrl');
        },

        /**
         * Creates a custom new incident type for a student.
         * @param  {String} label            
         * @param  {String} supportsDuration (default: false)
         * @param  {String} code             (optional)
         * @return {BehaviorIncidentType}                  
         */
        createIncidentType: function(label, supportsDuration, code, options) {
            return this.create({
                label: label,
                supportsDuration: supportsDuration,
                code: code || '',
                applicableStudent: this._student
            }, options);
        }
    });
});
