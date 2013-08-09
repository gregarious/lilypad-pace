describe('Student', function() {
	var _Student, student;
	beforeEach(module('pace'));
	beforeEach(inject(function(Student) {
		_Student = Student;
		student = new _Student();
	}));

	it('defaults to absent', function() {
		expect(student.get('isPresent')).toBe(false);
	});

	describe('.markAbsent', function() {
		beforeEach(function() {
			student.markPresent();
		});
		it('sets `isPresent` to false', function() {
			student.markAbsent();
			expect(student.get('isPresent')).toBe(false);
		});
	});

	describe('.markPresent', function() {
		it('sets `isPresent` to false', function() {
			student.markPresent();
			expect(student.get('isPresent')).toBe(true);
		});
	});
});
