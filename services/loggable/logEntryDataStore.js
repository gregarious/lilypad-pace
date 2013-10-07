/**
 * Manages collections of Loggable models for the current date (according
 * to timeTracker).
 *
 * Interface:
 * - getTodayForStudent: Returns a Student-specific collection of
 *     Loggables limited to a particular date.
 * - getForStudent: Returns a Student-specific collection of Loggables
 */
angular.module('pace').service('logEntryDataStore', function(timeTracker, behaviorIncidentDataStore, pointLossDataStore, $q) {

    var compositeLogCollectionFactory = function(collections) {
        var CompositeCollection = Backbone.Collection.extend({
            // order by newest first
            comparator: function(loggableModel) {
                return -loggableModel.getOccurredAt();
            },

            // override fetch to allow for composite promise behavior
            fetch: function(options) {
                var deferreds = [];
                _.each(collections, function(subcollection) {
                    var subpromise = $q.defer();
                    subcollection.fetch({
                        success: function(collection) {
                            subpromise.resolve();
                        },
                        error: function() {
                            subpromise.reject();
                        }
                    });
                    deferreds.push(subpromise);
                });

                // promise that will be returned from this meta-fetch call
                var promise = $q.defer();

                var thisCollection = this;
                $q.all(deferreds).then(function(subcollections) {
                    // main collection will already have been filled by 'add' listeners below
                    promise.resolve(thisCollection);
                }, function(reasons) {
                    promise.reject('error fetching collections');
                });

                return promise;
            }
        });

        var compositeCollection = new CompositeCollection();

        // add each component collection model to the composite
        _.each(collections, function(subcollection) {
            // hook up add/remove actions
            subcollection.on('add', function(model) {
                compositeCollection.add(model);
            });
            subcollection.on('remove', function(model) {
                compositeCollection.remove(model);
            });

            compositeCollection.add(subcollection.models);
        });

        return compositeCollection;
    };

    var cache = {};

    this.getTodayForStudent = function(student) {
        var collection = cache[student.id];
        if (!collection) {
            var incidentCollection = behaviorIncidentDataStore.getTodayIncidentsForStudent(student);
            var pointLossCollection = pointLossDataStore.getTodayPointLossesForStudent(student);

            collection = cache[student.id] = compositeLogCollectionFactory(
                [incidentCollection, pointLossCollection]);
            // TODO: move this outside after card #87 is out there
            collection.fetch();
        }

        return collection;
    };

    // this.getForStudent = function(student, startDate, endDate) {
    //     // Note: endDate is an exclusive bound
    //     var collection = cache[student.id];
    //     if (!collection) {
    //         var factory = loggableCollectionFactories.studentLog;
    //         collection = cache[student.id] = factory(student, startDate, endDate);
    //         collection.fetch();
    //     }
    //     return collection;
    // };
});
