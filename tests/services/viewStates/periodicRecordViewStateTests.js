describe('periodicRecordViewState', function() {
    // set up mock Student, PeriodicRecord and Loggable stores
    var studentA, recordsA, logsA, period2A;
    beforeEach(inject(function(APIBackedCollection, Student, studentAccessors, dailyPeriodicRecordStore, PeriodicRecord, periodicRecordCollectionFactories) {
        // TODO: don't like the dependency on an explicit url setting. put these in Model defs
        studentA = new Student({
            id: 1,
            periodicRecordsUrl: '/pr/1'
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
    }));

    describe('.periodicRecordViewState', function() {
        it('selectedPeriod defaults to null', inject(function(periodicRecordViewState) {
            expect(periodicRecordViewState.selectedPeriod).toBeNull();
        }));

        xit('updates on student change', inject(function(mainViewState, periodicRecordViewState) {
            mainViewState.setSelectedStudent(studentA);
            expect(periodicRecordViewState.selectedPeriod).toBe(recordsA);
        }));

        describe('.getSelectedPeriodNumber', function() {
            it('defaults to the app-wide current period', inject(function(timeTracker, periodicRecordViewState) {
                expect(periodicRecordViewState.getSelectedPeriodNumber()).toBe(timeTracker.currentPeriod);
            }));
        });

        describe('.setSelectedPeriodNumber', function() {
            var changeTriggered;

            beforeEach(inject(function(mainViewState, periodicRecordViewState) {
                // watch for change event for test below
                changeTriggered = false;
                periodicRecordViewState.on('change:selectedPeriod', function() {
                    changeTriggered = true;
                });

                mainViewState.setSelectedStudent(studentA);
                periodicRecordViewState.setSelectedPeriodNumber(2);
            }));

            it('changes .getSelectedPeriodNumber value', inject(function(periodicRecordViewState) {
                expect(periodicRecordViewState.getSelectedPeriodNumber()).toBe(2);
            }));

            it('changes the `seletedPeriod` model', inject(function(periodicRecordViewState) {
                expect(periodicRecordViewState.selectedPeriod).toBe(period2A);
            }));

            it('triggers a change:selectedPeriod event', function() {
                expect(changeTriggered).toBe(true);
            });
        });
    });
});
