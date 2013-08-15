describe('studentAccessors', function() {
	describe('.allStudents', function() {
		var allStudents;
		beforeEach(inject(function(studentAccessors) {
			allStudents = studentAccessors.allStudents;
		}));

		it('returns a promise for a Collection', function() {
			allStudents().then(function(students) {
				expect(students.models).toBeDefined();
			});
		});

		it('always returns the same Collection reference', function(){
			var firstResponse;
			allStudents().then(function(students) {
				firstResponse = students;
			});
			allStudents().then(function(students) {
				expect(students).toBe(firstResponse);
			});
		});

		// TODO: replace this trivial test and setup with a mocked API response
		xdescribe('with existing student models', function() {
			var students;
			beforeEach(function() {
				var students;
				allStudents().then(function(coll){
					students = coll;
					students.add({first_name: 'Leslie', last_name: 'Knope'});
					students.add({first_name: 'Ron', last_name: 'Swanson'});
				});
			});

			it('has length of 2', function() {
				expect(students.length).toBe(2);
			});
		});
	});
});
