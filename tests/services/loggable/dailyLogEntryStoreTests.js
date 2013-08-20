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

            // TODO: enable the rest after $http mocking works
            xit("contacts the behavior incidents endpoint with a date filter", function() {
                // TODO: ensure endpoint is contacted with date query
            });

            xit("contacts the point losses endpoint with a date filter", function() {
                // TODO: ensure endpoint is contacted with date query
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
