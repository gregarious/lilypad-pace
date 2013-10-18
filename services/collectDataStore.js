angular.module('pace').service('collectDataStore', function(Backbone, $q, periodicRecordDataStore, behaviorIncidentDataStore) {

    var LoggableCollection = Backbone.Collection.extend({
        comparator: function(loggableModel) {
            return -loggableModel.getOccurredAt();
        }
    });

    var promiseCache = {};

    this.loadTodayDataForStudent = function(student) {
        // if a promise was already made for this student, just return it. currently not supporting refresh.
        var oldPromise = promiseCache[student.id];
        if (oldPromise) {
            return oldPromise;
        }

        var deferredResponse = $q.defer();

        // Note we can't just user promises returned by the below functions directly
        // because they haven't been processed into Collections

        // watch the status of the PeriodicRecord fetch
        var deferredRecords = $q.defer();
        periodicRecordDataStore.getTodayRecordsForStudent(student).then(
            function(collection) {
                deferredRecords.resolve(collection);
            },
            function(err) {
                deferredRecords.reject(err);
            }
        );

        var deferredIncidents = $q.defer();
        behaviorIncidentDataStore.getTodayIncidentsForStudent(student).then(
            function(collection) {
                deferredIncidents.resolve(collection);
            },
            function(err) {
                deferredIncidents.reject(err);
            }
        );

        var compiledPromise = $q.all({
            periodicRecords: deferredRecords.promise,
            behaviorIncidents: deferredIncidents.promise
        });

        var responseData = {
            periodicRecordCollection: null,
            incidentLogCollection: null
        };

        // once both collections have been built/one has failed, we can respond to
        // the original external promise
        compiledPromise.then(
            function(collections) {
                // build the `incidentLogCollection` from PointLoss submodels inside
                // the BehaviorIncidents and submodels inside the PeriodicRecords
                var incidentModels = [];
                collections.periodicRecords.each(function(record) {
                    incidentModels = incidentModels.concat(record.get('pointLosses').models);
                });
                incidentModels = incidentModels.concat(collections.behaviorIncidents.models);

                deferredResponse.resolve({
                    periodicRecordCollection: collections.periodicRecords,
                    incidentLogCollection: new LoggableCollection(incidentModels)
                });
            },
            function(errors) {
                deferredResponse.reject("Error loading collect data.");
            }
        );

        promiseCache[student.id] = deferredResponse.promise;
        return deferredResponse.promise;
    };
});
