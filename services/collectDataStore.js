angular.module('pace').service('collectDataStore', function(Backbone, $q, timeTracker, periodicRecordDataStore, behaviorIncidentDataStore, behaviorIncidentTypeDataStore) {

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
                // Before returning, ensure we have a PeriodicRecord set for
                // the current period. If not, we need to create one client-side.
                // `syncPeriodicRecords` handles all of this.
                timeTracker.syncPeriodicRecords(student, collection);
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

        var derferredTypes = $q.defer();
        behaviorIncidentTypeDataStore.getTypesForStudent(student).then(
            function(collection) {
                derferredTypes.resolve(collection);
            },
            function(err) {
                derferredTypes.reject(err);
            }
        );


        var compiledPromise = $q.all({
            periodicRecords: deferredRecords.promise,
            behaviorIncidents: deferredIncidents.promise,
            behaviorTypes: derferredTypes.promise
        });

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
                    incidentLogCollection: new LoggableCollection(incidentModels),
                    behaviorTypeCollection: collections.behaviorTypes
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
