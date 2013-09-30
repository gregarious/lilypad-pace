/**
 * Provides factories to create new Collections of PointLosses.
 *
 * pointLossesForToday: Returns a new Collection of
 *                 PointLoss instances that happened
 *                 on today's date
 */

angular.module('pace').factory('pointLossCollectionFactories', function(timeTracker, PointLoss) {
    return {
        /**
         * Returns a new Collection of PointLosses for today's date.
         *
         * @param  {[type]} student Student
         * @return {Collection}
         */
        studentIncidentsForToday: function(student) {
            if (student.id === void 0) {
                throw Error("Valid student instance is required.");
            }

            var date = timeTracker.getTimestamp();
            var startDate = moment(date).startOf('day').format();
            var endDate = moment(date).add(1, 'day').startOf('day').format();
            var queryString = '?started_at__gte=' + startDate + '&started_at__lt=' + endDate;

            var url = student.get('behaviorIncidentsUrl') + queryString;
            var localStorageKey = 'TodayBehaviorIncidents-' + student.id;

            var TodayIncidentCollection = Backbone.PersistentCollection.extend({
                model: BehaviorIncident,
                url: url,
                date: date,

                localStorage: new Backbone.LocalStorage(localStorageKey)
            });

            return new TodayIncidentCollection();
        }
    };
});
