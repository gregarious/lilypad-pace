describe('collectViewState', function() {
    // set up mock Student, PeriodicRecord and Loggable stores
    var studentA, recordsA, logsA;
    beforeEach(inject(function(APIBackedCollection,  Student, studentAccessors, dailyPeriodicRecordStore, dailyLogEntryStore) {
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

        recordsA = new APIBackedCollection();
        logsA = new APIBackedCollection();
        spyOn(dailyPeriodicRecordStore, 'getForStudent').andReturn(recordsA);
        spyOn(dailyLogEntryStore, 'getForStudent').andReturn(logsA);
    }));

    describe('.periodicRecordViewState', function() {
        var periodicRecordViewState;
        beforeEach(inject(function(collectViewState) {
            periodicRecordViewState = collectViewState.periodicRecordViewState;
        }));

        it('collection defaults to an empty Collection', function() {
            expect(periodicRecordViewState.collection.length).toBe(0);
        });

        it('updates on student change', inject(function(mainViewState) {
            mainViewState.setSelectedStudent(studentA);
            expect(periodicRecordViewState.collection).toBe(recordsA);
        }));
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
