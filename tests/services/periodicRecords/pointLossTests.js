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
});
