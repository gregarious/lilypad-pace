describe('collectViewState', function() {
    // set up mock Student, PeriodicRecord and Loggable stores
    var studentA, recordsA, logsA, period2A;
    beforeEach(inject(function(APIBackedCollection, Student, studentAccessors, dailyPeriodicRecordStore, PeriodicRecord, periodicRecordCollectionFactories, dailyLogEntryStore) {
        // TODO: don't like the dependency on an explicit url setting. put these in Model defs
        studentA = new Student({
            id: 1,
            periodicRecordsUrl: '/pr/1',
            behaviorIncidentsUrl: '/bi/1',
            pointLossesUrl: '/pl/1',
            postsUrl: '/po/1'
        });

        var mockAllStudents = new APIBackedCollection([studentA]);
        spyOn(studentAccessors, 'allStudents').andReturn(mockAllStudents);

        recordsA = periodicRecordCollectionFactories.dailyStudentRecords(studentA, '2013-08-20');
        recordsA.add([
            new PeriodicRecord({period: 1}),
            period2A = new PeriodicRecord({period: 2})
        ]);
        logsA = new APIBackedCollection();
        spyOn(dailyPeriodicRecordStore, 'getForStudent').andReturn(recordsA);
        spyOn(dailyLogEntryStore, 'getForStudent').andReturn(logsA);
    }));

    describe('.periodicRecordViewState', function() {
        var periodicRecordViewState;
        beforeEach(inject(function(collectViewState) {
            periodicRecordViewState = collectViewState.periodicRecordViewState;
        }));

        it('selectedPeriod defaults to null', function() {
            expect(periodicRecordViewState.selectedPeriod).toBeNull();
        });

        xit('updates on student change', inject(function(mainViewState) {
            mainViewState.setSelectedStudent(studentA);
            expect(periodicRecordViewState.selectedPeriod).toBe(recordsA);
        }));

        describe('.getSelectedPeriodNumber', function() {
            it('defaults to the app-wide current period', inject(function(timeTracker) {
                expect(periodicRecordViewState.getSelectedPeriodNumber()).toBe(timeTracker.currentPeriod);
            }));
        });

        describe('.setSelectedPeriodNumber', function() {
            var changeTriggered;

            beforeEach(inject(function(mainViewState) {
                // watch for change event for test below
                changeTriggered = false;
                periodicRecordViewState.on('change:selectedPeriod', function() {
                    changeTriggered = true;
                });

                mainViewState.setSelectedStudent(studentA);
                periodicRecordViewState.setSelectedPeriodNumber(2);
            }));

            it('changes .getSelectedPeriodNumber value', function() {
                expect(periodicRecordViewState.getSelectedPeriodNumber()).toBe(2);
            });

            it('changes the `seletedPeriod` model', function() {
                expect(periodicRecordViewState.selectedPeriod).toBe(period2A);
            });

            it('triggers a change:selectedPeriod event', function() {
                expect(changeTriggered).toBe(true);
            });
        });
    });

    describe('.activityLogViewState', function() {
        var activityLogViewState;
        beforeEach(inject(function(collectViewState) {
            activityLogViewState = collectViewState.activityLogViewState;
        }));

        it('collection defaults to an empty Collection', function() {
            expect(activityLogViewState.collection.length).toBe(0);
        });

        it('updates on student change', inject(function(mainViewState) {
            mainViewState.setSelectedStudent(studentA);
            expect(activityLogViewState.collection).toBe(logsA);
        }));
    });
});
