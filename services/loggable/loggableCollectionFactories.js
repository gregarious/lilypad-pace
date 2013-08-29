/**
 * Provides factories to create new Collections of Loggable objects.
 *
 * Factories provided:
 * - studentLog: Collection of student-owned Loggable models limited to a
 *     certain time range
 * - dailyStudentLog: Collection of student-owned Loggable models the
 *     occurred on a particular date
 */
angular.module('pace').factory('loggableCollectionFactories', function(APIBackedCollection, BehaviorIncident, PointLoss, moment, $q) {
    /**
     * Returns a new Collection of Loggable models for a given student
     * in a given date range.
     *
     * @param  {Student} student    (must have `behaviorIncidentsUrl` and
     *                              `pointLossesUrl` attributes defined)
     * @param  {Date} startDate
     * @param  {Date} endDate
     * @return {Collection instance}
     */
    var studentLog = function(student, startDate, endDate) {
        var incidentArgs = [];
        if (startDate) {
            incidentArgs.push('started_at__gte=' + moment(startDate).format());
        }
        if (endDate) {
            incidentArgs.push('started_at__lt=' + moment(endDate).format());
        }

        var incidents = new (APIBackedCollection.extend({
            model: BehaviorIncident,
            url: student.get('behaviorIncidentsUrl') + '?' + (incidentArgs.length ? incidentArgs.join('&') : '')
        }))();

        var pointLossArgs = [];
        if (startDate) {
            pointLossArgs.push('periodic_record__date__gte=' + moment(startDate).format());
        }
        if (endDate) {
            pointLossArgs.push('periodic_record__date__lt=' + moment(endDate).format());
        }

        var pointLosses = new (APIBackedCollection.extend({
            model: PointLoss,
            url: student.get('pointLossesUrl') + '?' + (pointLossArgs.length ? pointLossArgs.join('&') : '')
        }))();

        var StudentLogEntryCollection = APIBackedCollection.extend({
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

        return new StudentLogEntryCollection();
    };

    /**
     * Returns a new Collection of Loggable models for a given student
     * that occurred on a given date.
     *
     * @param  {Student} student    (must have `behaviorIncidentsUrl` and
     *                              `pointLossesUrl` attributes defined)
     * @param  {String/Date} date   (ISO formatted string or Date)
     *
     * @return {Collection instance}
     */
    var dailyStudentLog = function(student, date) {
        var startDate = moment(date).startOf('day').format();
        var endDate = moment(date).add(1, 'day').startOf('day').format();
        return studentLog(student, startDate, endDate);
    };

    return {
        dailyStudentLog: dailyStudentLog,
        studentLog: studentLog
    };
});
