describe("dailyLogEntryStore", function() {
    describe(".getForStudent", function() {
        var student;
        beforeEach(inject(function(Student) {
            student = new Student({
                id: 4,
                behaviorIncidentsUrl: '/bi',
                pointLossesUrl: '/pl',
            });
        }));

        describe("on first access", function() {
            var studentEntries;
            beforeEach(inject(function(dailyLogEntryStore) {
                studentEntries = dailyLogEntryStore.getForStudent(student);
            }));

            it("returns an empty Collection", function() {
                expect(studentEntries.models.length).toBe(0);
            });

            it("returns a Collection with its first sync in progress", function() {
                expect(studentEntries.lastSyncedAt).toBe(null);
                expect(studentEntries.isSyncInProgress).toBe(true);
            });
        });

        describe("after collection syncs", function() {
            var studentEntries;
            beforeEach(inject(function(dailyLogEntryStore) {
                studentEntries = dailyLogEntryStore.getForStudent(student);
            }));

            // TODO: add a $http/timeTracker-mocked test to ensure filtering works
            xit("only entries from given day are present", function() {
                expect(studentEntries.models.length).toBe(3);
                studentEntries.each(function(logEntry) {
                    expect(moment(logEntry.occurredAt().format("YYYY-MM-DD"))).toEqual('2013-08-20');
                });
            });

            xdescribe("on subsequent accesses", function() {
                var studentEntries2;
                beforeEach(inject(function(dailyLogEntryStore) {
                    // flush $http
                    studentEntries2 = dailyLogEntryStore.getForStudent(student);
                }));

                it("returns the same collection", function() {
                    expect(studentEntries2).toBe(studentEntries);
                });

                it("does not automatically sync again", function() {
                    expect(studentEntries2.isSyncInProgress()).toBe(false);
                });
            });
        });
    });
});
