describe("dailyPeriodicRecordStore", function() {
    describe(".getForStudent", function() {
        var student;
        beforeEach(inject(function(Student) {
            student = new Student({
                id: 4,
                periodicRecordsUrl: '/pr',
            });
        }));

        describe("on first access", function() {
            var studentRecords;
            beforeEach(inject(function(dailyPeriodicRecordStore) {
                studentRecords = dailyPeriodicRecordStore.getForStudent(student);
            }));

            it("returns an empty Collection", function() {
                expect(studentRecords.models.length).toBe(0);
            });

            it("returns a Collection with its first sync in progress", function() {
                expect(studentRecords.lastSyncedAt).toBe(null);
                expect(studentRecords.isSyncInProgress).toBe(true);
            });
        });

        describe("after collection syncs", function() {
            var studentRecords;
            beforeEach(inject(function(dailyPeriodicRecordStore) {
                studentRecords = dailyPeriodicRecordStore.getForStudent(student);
            }));

            // TODO: add a $http/timeTracker-mocked test to ensure filtering works
            xit("only records from given date are present", function() {
                expect(studentRecords.models.length).toBe(3);
                studentRecords.each(function(record) {
                    expect(record.get('date')).toEqual('2013-08-20');
                });
            });

            xdescribe("on subsequent accesses", function() {
                var studentRecords2;
                beforeEach(inject(function(dailyPeriodicRecordStore) {
                    // flush $http
                    studentRecords2 = dailyPeriodicRecordStore.getForStudent(student);
                }));

                it("returns the same collection", function() {
                    expect(studentRecords2).toBe(studentRecords);
                });

                it("does not automatically sync again", function() {
                    expect(studentRecords2.isSyncInProgress()).toBe(false);
                });
            });
        });
    });
});


/*

    // set up some values to be used in specs below
    var student, dateString;
    beforeEach(inject(function(Student) {
        student = new Student({
            id: 4,
            periodicRecordsUrl: '/pace/students/4/periodicrecords/'
        });
        dateString = '2013-01-01';
    }));

    describe("constructor", function() {
        it("should fail if called with no student", inject(function(DailyStudentRecordCollection) {
            var newCall = function() {
                new DailyStudentRecordCollection({dateString: dateString});
            };
            expect(newCall).toThrow();
        }));

        it("should fail if called with no date", inject(function(DailyStudentRecordCollection) {
            var newCall = function() {
                new DailyStudentRecordCollection({student: student});
            };
            expect(newCall).toThrow();
        }));
    });

    describe("instance", function() {
        var pd1, pd2, collection;
        beforeEach(inject(function(PeriodicRecord, DailyStudentRecordCollection) {
            // mock out syncing for now
            spyOn(Backbone, 'sync');

            // Note: DSRCollection is should rarely, if ever, be built
            // manually like this. Typicaly it will be populated with
            // a fetch call or via createPeriodicRecord calls.
            pd1 = new PeriodicRecord({
                student: student,
                dateString: dateString,
                period: 1
            });
            pd2 = new PeriodicRecord({
                student: student,
                dateString: dateString,
                period: 2
            });

            collection = new DailyStudentRecordCollection([pd1, pd2], {
                student: student,
                dateString: dateString
            });
        }));

        describe('.url', function() {
            it('should return expected url with options', function() {
                expect(collection.url()).toBe('/pace/students/4/periodicrecords/?date=2013-01-01');
            });
        });

        describe('.getByPeriod', function() {
            it('should return expected model when queried', function() {
                expect(collection.getByPeriod(1)).toBe(pd1);
            });
            it("should return undefined when queried period doesn't exist", function() {
                expect(collection.getByPeriod(3)).toBeUndefined();
            });
            it('should return the latest period if no argument given', function() {
                expect(collection.getByPeriod()).toBe(pd2);
            });
        });

        describe('.createPeriodicRecord', function() {
            beforeEach(function() {
                spyOn(collection, 'create').andCallThrough();
            });

            it('defers to create', function() {
                var newRecord = collection.createPeriodicRecord(3);
                expect(collection.create).toHaveBeenCalled();
                // sanity check, just ensure model is in collection
                expect(collection).toContain(newRecord);
            });

            it('creates an instance with expected student and date', function() {
                var newRecord = collection.createPeriodicRecord(3);
                expect(newRecord.get('student')).toBe(student);
                expect(newRecord.get('date')).toBe(dateString);
            });

            it('defaults to creating a record with `isEligible` == true', function() {
                var newRecord = collection.createPeriodicRecord(3);
                expect(newRecord.get('isEligible')).toBe(true);
            });

            it('defaults to creating a record with point values set to 2', function() {
                var newRecord = collection.createPeriodicRecord(3, true);
                expect(newRecord.get('points')).toBeDefined();
                _.each(newRecord.get('points'), function(val) {
                    expect(val).toBe(2);
                });
            });

            it('sets all point values to the initial point value', function() {
                var newRecord = collection.createPeriodicRecord(3, true, 4);
                expect(newRecord.get('points')).toBeDefined();
                _.each(newRecord.get('points'), function(val) {
                    expect(val).toBe(4);
                });
            });
        });
    });
*/