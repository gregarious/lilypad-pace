describe('studentAccessors', function() {
	/* Set up module/type injectors */
	var _studentAccessors;
	beforeEach(module('pace'));
	beforeEach(inject(function(studentAccessors) {
		_studentAccessors = studentAccessors;
	}));

	/* Start actual specs */
	describe('.allStudents', function() {
		var allStudents;
		beforeEach(function() {
			allStudents = _studentAccessors.allStudents();
		});

		it('returns a Collection', function() {
			expect(allStudents.models).toBeDefined();
		});

		it('always returns the same Collection', function() {
			var allStudents2 = _studentAccessors.allStudents();
			expect(allStudents).toBe(allStudents2);
		});

		describe('with existing student models', function() {
			beforeEach(function() {
				allStudents.add({first_name: 'Leslie', last_name: 'Knope'});
				allStudents.add({first_name: 'Ron', last_name: 'Swanson'});
			});

			// TODO: replace this trivial test and setup with a mocked API response
			it('has length of 2', function() {
				expect(allStudents.length).toBe(2);
			});
		});
	});
});
