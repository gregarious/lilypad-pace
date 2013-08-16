angular.module('pace').factory('DailyStudentIncidentCollection', function(Backbone, moment, BehaviorIncident) {
    return Backbone.Collection.extend({
        model: BehaviorIncident,

        /**
         * Collection must be initialized with an options dict that
         * includes `student` and `dateString`.
         */
        initialize: function(models, options) {
            options = options || {};
            if (_.isUndefined(options.student) || _.isUndefined(options.dateString)) {
                throw new Error("Constructor must be called with `student` and `dateString` in options hash");
            }

            this._student = options.student;
            this._dateString = options.dateString;
        },

        url: function() {
            // Only query incidents that started on this collection's date
            var rangeStart = moment(this._dateString).format();
            var rangeEnd = moment(this._dateString).add('days', 1).format();
            var querystring = 'started_at__gte=' + rangeStart + '&' + 'started_at__lt=' + rangeEnd;
            return this._student.get('behaviorIncidentsUrl') + '?' + querystring;
        },

        /**
         * Wrapper around Collection.create that inserts student into
         * attributes for new Model. Don't use create directly.
         *
         * TODO: note there's no sanity check that we're actually inserting
         * an incident that is happening on the given day. Need to consider
         * best way to handle this (should we even be using this collection
         * to create incidents?)
         *
         * @param  {BehaviorIncidentType} type
         * @param  {Date} startedAt
         * @param  {Date or null} endedAt
         * @param  {String} comment
         * @param  {Object} options             Typical Backbone.create options
         * @return {BehaviorIncident}
         */
        createIncident: function(type, startedAt, endedAt, comment, options) {
            // set arugment defaults
            endedAt = _.isUndefined(endedAt) ? null : endedAt;
            comment = _.isUndefined(comment) ? "" : comment;

            return this.create({
                student: this._student,
                type: type,
                startedAt: startedAt,
                endedAt: endedAt,
                comment: comment
            }, options);
        }
    });
});