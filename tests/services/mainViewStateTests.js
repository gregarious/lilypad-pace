describe("mainViewState", function() {
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

    describe('.getSelectedStudent', function() {
        it('defaults to null', inject(function(mainViewState) {
            expect(mainViewState.getSelectedStudent()).toBeNull();
        }));
    });

    describe('.setSelectedStudent', function() {
        var changeTriggered;
        beforeEach(inject(function(mainViewState) {
            changeTriggered = false;
            mainViewState.on('change:selectedStudent', function() {
                changeTriggered = true;
            });

            mainViewState.setSelectedStudent(studentA);
        }));

        it('changes .getSelectedStudent value', inject(function(mainViewState) {
            expect(mainViewState.getSelectedStudent()).toBe(studentA);
        }));

        it("triggers 'change' event", function() {
            expect(changeTriggered).toBe(true);
        });
    });

    describe('.collectViewState', function() {
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

        describe('.periodicRecordViewState', function() {
            var periodicRecordViewState;
            beforeEach(inject(function(mainViewState) {
                periodicRecordViewState = mainViewState.collectViewState.periodicRecordViewState;
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
            beforeEach(inject(function(mainViewState) {
                activityLogViewState = mainViewState.collectViewState.activityLogViewState;
            }));

            it('collection defaults to an empty Collection', inject(function(mainViewState) {
                expect(activityLogViewState.collection.length).toBe(0);
            }));

            it('updates on student change', inject(function(mainViewState) {
                mainViewState.setSelectedStudent(studentA);
                expect(activityLogViewState.collection).toBe(logsA);
            }));
        });
    });

    describe('.discussViewState', function() {
        // set up mock PeriodicRecord and Loggable stores
        var postsA, postsB;
        beforeEach(inject(function(APIBackedCollection, discussionPostStore) {
            postsA = new APIBackedCollection();
            postsB = new APIBackedCollection();
            spyOn(discussionPostStore, 'getForStudent').andCallFake(function(student) {
                return student.id === 1 ? postsA : postsB;
            });
        }));

        var discussViewState;
        beforeEach(inject(function(mainViewState) {
            discussViewState = mainViewState.discussViewState;
        }));

        describe('.posts', function() {
            it('collection defaults to an empty Collection', inject(function(mainViewState) {
                expect(discussViewState.collection.length).toBe(0);
            }));

            it('updates on student change', inject(function(mainViewState) {
                mainViewState.setSelectedStudent(studentA);
                expect(discussViewState.collection).toBe(postsA);
            }));
        });
    });
});
