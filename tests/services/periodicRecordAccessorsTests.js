describe("periodicRecordAccessors", function() {
    describe(".dailyStudentRecords", function() {
        var student, dateString, dailyStudentRecords, records;
        beforeEach(inject(function(Student, periodicRecordAccessors) {
            dailyStudentRecords = periodicRecordAccessors.dailyStudentRecords;

            // mock out syncing for now
            spyOn(Backbone, 'sync');

            student = new Student({id: 4});
            dateString = '2013-01-01';
            records = dailyStudentRecords(student, dateString);
        }));

        it('returns a DailyStudentRecordCollection with expected settings', inject(function(DailyStudentRecordCollection) {
            expect(records.constructor).toBe(DailyStudentRecordCollection);
            expect(records._student).toBe(student);
            expect(records._dateString).toBe('2013-01-01');
        }));

        it('returns the same collection instance when called twice', function() {
            var records2 = dailyStudentRecords(student, dateString);
            expect(records).toBe(records2);
        });

        it("returns collection for today's date if none is specified", function() {
            var today = moment().format('YYYY-MM-DD');
            var todayRecords = dailyStudentRecords(student);
            expect(todayRecords._dateString).toBe(today);
        });
    });
});
