angular.module('pace').service('collectDataStore', function(Backbone, $q, $rootScope, timeTracker, periodicRecordDataStore, behaviorIncidentDataStore, behaviorIncidentTypeDataStore) {

    var LoggableCollection = Backbone.Collection.extend({
        comparator: function(loggableModel) {
            return -loggableModel.getOccurredAt();
        }
    });

    var promiseCache = {};
    var loadedRecordsPackages = []; // a cache of {student: <Student>, records: <Collection<PdRecord>>}
                                    // objects to be used in the period monitoring code (updateRecordsOnPeriodChange)

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
                syncPeriodicRecords(student, collection);

                // Also, register this student/collection combo to be updated
                // when the period changes
                loadedRecordsPackages.push({
                    student: student,
                    todayRecordCollection: collection
                });

                // finally ready to return
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

    // set up a scope for the purposes of watching the timeTracker for period changes
    // is this really the best way to do this? #refactor
    var scope = $rootScope.$new();
    scope.timeTracker = timeTracker;
    scope.$watch('timeTracker.currentPeriodNumber', updateRecordsOnPeriodChange);

    /**
     * If student is present, function will cycle through all periods
     * in the active attendance span ensuring that a PeriodicRecord
     * exists for each.
     *
     * If student is absent, will fill in any missing PeriodicRecords
     * between the beginning of the day and now with records with
     * isEligible = false.
     *
     * @param  {Student} student (must support `isPresent` method
     *                   and `activeAttendanceSpan` attribute)
     * @param  {Collection} todayRecordCollection (must support
     *                  `getByPeriod` method)
     */
    function syncPeriodicRecords(student, todayRecordCollection) {
        var activeSpan = student.get('activeAttendanceSpan');
        var iterPd;
        if (activeSpan) {
            iterPd = timeTracker.getPeriodForTime(activeSpan.get('timeIn'));
        }
        else {
            iterPd = 1;
        }
        var lastPd = timeTracker.getPeriodForTime(timeTracker.getTimestampAsMoment().format('HH:mm'));

        while(iterPd <= lastPd) {
            if (!todayRecordCollection.getByPeriod(iterPd)) {
                todayRecordCollection.create({
                    date: timeTracker.getTimestampAsMoment().format('YYYY-MM-DD'),
                    period: iterPd,
                    student: student,
                    isEligible: !!activeSpan
                });
            }
            ++iterPd;
        }
    }

    /**
     * Cycle through the registered PeriodicRecord collections (saved in
     * `loadedRecordsPackages`) and adds a new record for the given period
     * if it doesn't exist.
     * @param  {Number} periodNumber
     */
    function updateRecordsOnPeriodChange(periodNumber) {
        _.each(loadedRecordsPackages, function(pkg) {
            if (!pkg.todayRecordCollection.getByPeriod(periodNumber)) {
                pkg.todayRecordCollection.create({
                    date: timeTracker.getTimestampAsMoment().format('YYYY-MM-DD'),
                    period: periodNumber,
                    student: pkg.student,
                    isEligible: pkg.student.isPresent()
                });
            }
        });

    }
});
