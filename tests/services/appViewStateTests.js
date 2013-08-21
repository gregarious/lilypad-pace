describe("appViewState", function() {
    // set up mock student store
    var studentA, studentB;
    beforeEach(inject(function(APIBackedCollection, Student, studentAccessors) {
        // TODO: don't like the dependency on an explicit url setting. put these in Model defs
        studentA = new Student({
            id: 1,
            periodicRecordsUrl: '/pr/1',
            behaviorIncidentsUrl: '/bi/1',
            pointLossesUrl: '/pl/1',
            postsUrl: '/po/1'
        });
        studentB = new Student({
            id: 2,
            periodicRecordsUrl: '/pr/2',
            behaviorIncidentsUrl: '/bi/2',
            pointLossesUrl: '/pl/2',
            postsUrl: '/po/1'
        });

        var mockAllStudents = new APIBackedCollection([studentA, studentB]);
        spyOn(studentAccessors, 'allStudents').andReturn(mockAllStudents);
    }));

    describe('.selectedStudent', function() {
        describe('.get', function() {
            it('defaults to null', inject(function(appViewState) {
                expect(appViewState.selectedStudent.get()).toBeNull();
            }));
        });

        describe('.set', function() {
            var changeTriggered;
            beforeEach(inject(function(appViewState) {
                changeTriggered = false;
                appViewState.selectedStudent.on('change', function() {
                    changeTriggered = true;
                });

                appViewState.selectedStudent.set(studentA);
            }));

            it('changes .getSelectedStudent value', inject(function(appViewState) {
                expect(appViewState.selectedStudent.get()).toBe(studentA);
            }));

            it("triggers 'change' event", function() {
                expect(changeTriggered).toBe(true);
            });
        });
    });

    describe('.collect', function() {
        // set up mock PeriodicRecord and Loggable stores
        var recordsA, recordsB, logsA, logsB;
        beforeEach(inject(function(APIBackedCollection, dailyPeriodicRecordStore, dailyLogEntryStore) {
            recordsA = new APIBackedCollection();
            recordsB = new APIBackedCollection();
            logsA = new APIBackedCollection();
            logsB = new APIBackedCollection();
            spyOn(dailyPeriodicRecordStore, 'getForStudent').andCallFake(function(student) {
                return student.id === 1 ? recordsA : recordsB;
            });
            spyOn(dailyLogEntryStore, 'getForStudent').andCallFake(function(student) {
                return student.id === 1 ? logsA : logsB;
            });
        }));

        describe('.periodicRecords', function() {
            it('defaults to an empty Collection', inject(function(appViewState) {
                expect(appViewState.collect.periodicRecords.length).toBe(0);
            }));

            it('updates on student change', inject(function(appViewState) {
                appViewState.selectedStudent.set(studentA);
                expect(appViewState.collect.periodicRecords).toBe(recordsA);
            }));
        });

        describe('.activityLog', function() {
            it('defaults to an empty Collection', inject(function(appViewState) {
                expect(appViewState.collect.activityLog.length).toBe(0);
            }));

            it('updates on student change', inject(function(appViewState) {
                appViewState.selectedStudent.set(studentA);
                expect(appViewState.collect.activityLog).toBe(logsA);
            }));
        });
    });

    describe('.discuss', function() {
        // set up mock PeriodicRecord and Loggable stores
        var postsA, postsB;
        beforeEach(inject(function(APIBackedCollection, discussionPostStore) {
            postsA = new APIBackedCollection();
            postsB = new APIBackedCollection();
            spyOn(discussionPostStore, 'getForStudent').andCallFake(function(student) {
                return student.id === 1 ? postsA : postsB;
            });
        }));

        describe('.posts', function() {
            it('defaults to an empty Collection', inject(function(appViewState) {
                expect(appViewState.discuss.posts.length).toBe(0);
            }));

            it('updates on student change', inject(function(appViewState) {
                appViewState.selectedStudent.set(studentA);
                expect(appViewState.discuss.posts).toBe(postsA);
            }));
        });
    });
});
