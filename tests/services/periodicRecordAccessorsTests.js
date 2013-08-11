describe("periodicRecordAccessors", function() {
	/* Set up module/type injectors */
    var _periodicRecordAccessors, _DailyStudentRecordCollection, _Student;
    beforeEach(module('pace'));
    beforeEach(inject(function(periodicRecordAccessors, DailyStudentRecordCollection, Student) {
        _periodicRecordAccessors = periodicRecordAccessors;
        _DailyStudentRecordCollection = DailyStudentRecordCollection;
        _Student = Student;
    }));

    /* Start actual specs */
    describe(".dailyStudentRecords", function() {
        var records, student, dateString;
        beforeEach(function() {
            // mock out syncing for now
            spyOn(Backbone, 'sync');

            student = new _Student({id: 4});
            dateString = '2013-01-01';
            records = _periodicRecordAccessors.dailyStudentRecords(student, dateString);
        });

        it('returns a DailyStudentRecordCollection with expected settings', function() {
            expect(records.constructor).toBe(_DailyStudentRecordCollection);
            expect(records._student).toBe(student);
            expect(records._dateString).toBe('2013-01-01');
        });

        it('returns the same collection instance when called twice', function() {
            var records2 = _periodicRecordAccessors.dailyStudentRecords(student, dateString);
            expect(records).toBe(records2);
        });

        it("returns collection for today's date if none is specified", function() {
            var today = moment().format('YYYY-MM-DD');
            var todayRecords = _periodicRecordAccessors.dailyStudentRecords(student);
            expect(todayRecords._dateString).toBe(today);
        });
    });
});
