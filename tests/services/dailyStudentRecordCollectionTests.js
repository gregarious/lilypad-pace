describe("DailyStudentRecordCollection", function() {
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
        beforeEach(inject(function(DailyStudentRecordCollection) {
            it("should fail if called with no student", function() {
                var newCall = function() {
                    new DailyStudentRecordCollection({dateString: dateString});
                };
                expect(newCall).toThrow();
            });

            it("should fail if called with no date", function() {
                var newCall = function() {
                    new DailyStudentRecordCollection({student: student});
                };
                expect(newCall).toThrow();
            });
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

        describe('.getPeriodicRecord', function() {
            it('should return expected model when queried', function() {
                expect(collection.getPeriodicRecord(2)).toBe(pd2);
            });
            it("should return undefined when queried period doesn't exist", function() {
                expect(collection.getPeriodicRecord(3)).toBeUndefined();
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
});
