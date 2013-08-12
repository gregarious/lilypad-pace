describe('studentAccessors', function() {
	describe('.allStudents', function() {
		var allStudents;
		beforeEach(inject(function(studentAccessors) {
			allStudents = studentAccessors.allStudents;
		}));

		it('returns a Collection', function() {
			expect(allStudents().models).toBeDefined();
		});

		it('always returns the same Collection reference', function(){
			expect(allStudents()).toBe(allStudents());
		});

		describe('with existing student models', function() {
			var students;
			beforeEach(function() {
				students = allStudents();
				students.add({first_name: 'Leslie', last_name: 'Knope'});
				students.add({first_name: 'Ron', last_name: 'Swanson'});
			});

			// TODO: replace this trivial test and setup with a mocked API response
			it('has length of 2', function() {
				expect(students.length).toBe(2);
			});
		});
	});
});
