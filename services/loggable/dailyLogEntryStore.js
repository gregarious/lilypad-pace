angular.module('pace').factory('dailyLogEntryStore', function(APIBackedCollection, timeTracker, BehaviorIncident, PointLoss, moment, $q) {
    var cache = {};

    var buildCollection = function(student, date) {
        var incidentArgs = [];
        var dateQuery = 'started_at__gte=' + moment(date).startOf('day').format();
            dateQuery += '&started_at__lte=' + moment(date).endOf('day').format();

        var incidents = new (APIBackedCollection.extend({
            model: BehaviorIncident,
            url: student.get('behaviorIncidentsUrl') + '?' + dateQuery
        }))();

        var pointLosses = new (APIBackedCollection.extend({
            model: PointLoss,
            url: student.get('pointLossesUrl')
        }))();

        var EntryCollection = APIBackedCollection.extend({
            comparator: function(loggableModel) {
                return -loggableModel.getOccurredAt();
            },

            fetch: function(options) {
                if (options && options.length > 0) {
                    throw new Error("Collection does not support fetch options");
                }

                var deferredIncidents = $q.defer();
                incidents.fetch({
                    success: function(collection) {
                        deferredIncidents.resolve(collection);
                    }
                });

                var deferredPointLosses = $q.defer();
                pointLosses.fetch({
                    success: function(collection) {
                        deferredPointLosses.resolve(collection);
                    }
                });

                // reference needed in nested `each` statements below
                var compositeCollection = this;

                this.isSyncInProgress = true;
                var deferred = $q.defer();
                // when all collections have returned, we can fulfill this promise
                $q.all([deferredIncidents.promise,
                        deferredPointLosses.promise]).then(function(collections) {

                    // add models from each collection
                    _.each(collections, function(collection, index) {
                        // need to avoid index collisions, so change the id
                        // of each model before adding
                        var idPrefix = parseInt(index, 10) + '_';
                        collection.each(function(model) {
                            model.id = idPrefix + model.id;
                            compositeCollection.add(model);
                        });
                    });
                    deferred.resolve(compositeCollection);

                    compositeCollection.isSyncInProgress = false;
                    compositeCollection.lastSyncedAt = new Date();
                }, function(reasons) {
                    // error handling here
                    deferred.reject('error fetching logs');
                    compositeCollection.isSyncInProgress = false;
                    compositeCollection.lastSyncedAt = null;
                });

                return deferred.promise;
            }
        });

        return new EntryCollection();
    };

    return {
        getForStudent: function(student) {
            var collection = cache[student.id];
            if (!collection) {
                collection = cache[student.id] = buildCollection(student, timeTracker.currentDate);
                collection.fetch();
            }
            return collection;
        }
    };
});
