describe('Student', function() {
	var student;
	beforeEach(inject(function(Student) {
		student = new Student();
	}));

	it('defaults to absent', function() {
		expect(student.isPresent()).toBe(false);
	});

	describe('.markAbsent', function() {
		beforeEach(function() {
			student.markPresent();
		});
		it('sets `isPresent` to false', function() {
			student.markAbsent();
			expect(student.isPresent()).toBe(false);
		});
	});

	describe('.markPresent', function() {
		it('sets `isPresent` to false', function() {
			student.markPresent();
			expect(student.isPresent()).toBe(true);
		});
	});
});
