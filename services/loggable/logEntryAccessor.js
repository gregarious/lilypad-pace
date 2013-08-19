angular.module('pace').factory('logEntryAccessor', function(Backbone, BehaviorIncident, PointLoss, moment, $q) {
    /**
     * Returns a promise for a Collection of Loggable models for a given student
     * in a given date range.
     *
     * @param  {Student} student    (must have `behaviorIncidentsUrl` and
     *                              `pointLossesUrl` attributes defined)
     * @param  {Date} startDate
     * @param  {Date} endDate
     * @return {Promise}
     */
    return function(student, startDate, endDate) {
        var incidentArgs = [];
        if (startDate) {
            incidentArgs.push('started_at__gte=' + moment(startDate).format());
        }
        if (endDate) {
            incidentArgs.push('started_at__lt=' + moment(endDate).format());
        }

        var incidents = new (Backbone.Collection.extend({
            model: BehaviorIncident,
            url: student.get('behaviorIncidentsUrl') + (incidentArgs.length ? incidentArgs.join('&') : '')
        }))();

        var deferredIncidents = $q.defer();
        incidents.fetch({
            success: function(collection) {
                deferredIncidents.resolve(collection);
            }
        });

        var pointLosses = new (Backbone.Collection.extend({
            model: PointLoss,
            url: student.get('pointLossesUrl')
        }))();

        var deferredPointLosses = $q.defer();
        pointLosses.fetch({
            success: function(collection) {
                deferredPointLosses.resolve(collection);
            }
        });

        var deferred = $q.defer();
        // when all collections have returned, we can fulfill this promise
        $q.all([deferredIncidents.promise,
                deferredPointLosses.promise]).then(function(collections) {

            // compile all returned collections into one
            var entryCollection = new Backbone.Collection([], {
                comparator: function(loggableModel) {
                    return -loggableModel.getOccurredAt();
                }
            });

            // add models from each collection
            _.each(collections, function(collection, index) {
                // need to avoid index collisions, so change the id
                // of each model before adding
                var idPrefix = parseInt(index, 10) + '_';
                collection.each(function(model) {
                    model.id = idPrefix + model.id;
                    entryCollection.add(model);
                });
            });

            deferred.resolve(entryCollection);
        }, function(reasons) {
            // error handling here
            deferred.reject('error fetching logs');
        });

        return deferred.promise;
    };
});