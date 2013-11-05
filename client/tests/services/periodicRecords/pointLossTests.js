describe("PointLoss", function() {
    var lossRecord, student, pdRecord;
    beforeEach(inject(function(PointLoss, PeriodicRecord, Student) {
        student = new Student();
        pdRecord = new PeriodicRecord({student: student});
        lossRecord = new PointLoss({
            periodicRecord: pdRecord,
            pointType: 'bs',
            occurredAt: new Date(2013, 0, 1, 12, 0, 0)
        });
    }));

    it('conforms to Loggable interface', function() {
        expect(lossRecord).toImplementLoggable();
    });

    it('.getLabel returns loss type in English', function() {
        expect(lossRecord.getLabel()).toBe("'Be Safe' Point Loss");
    });

    it('.getOccurredAt returns `occurredAt`', function() {
        expect(lossRecord.getOccurredAt()).toEqual(new Date(2013, 0, 1, 12, 0, 0));
    });

    it(".getStudent returns the periodicRecords's student value", function() {
        expect(lossRecord.getStudent()).toBe(lossRecord.get('periodicRecord').get('student'));
    });

    describe('with no PeriodicRecord', function() {
        it('.getStudent returns null', function() {
            lossRecord.unset('periodicRecord');
            expect(lossRecord.getStudent()).toBeNull();
        });
    });

    describe('.parse', function() {
        var response;
        beforeEach(inject(function(PointLoss) {
            lossRecord = new PointLoss();
            var responseJSON = {
                "id": 1,
                "occurred_at": "2013-01-01T13:00:00Z",
                "periodic_record": {
                    "id": 8,
                },
                "point_type": "fd",
                "comment": ""
            };
            response = lossRecord.parse(responseJSON);
        }));

        it("creates a Date object `occurredAt`", inject(function(moment) {
            expect(response.occurredAt).toEqual(moment('2013-01-01T13:00:00Z').toDate());
        }));

        // TODO: add test to ensure PeriodicRecord instance stub is created
    });
});
