// TODO: re-enable once I figure out why we're having trouble with $http
xdescribe('studentAccessors', function() {
	describe('.allStudents', function() {
		beforeEach(inject(function($injector) {
			$httpBackend = $injector.get('$httpBackend');
			$httpBackend.when('GET', '/pace/students/').respond([
				{"id": 1, "first_name": "Leslie", "last_name": "Nielsen"},
				{"id": 2, "first_name": "Ron", "last_name": "Swanson"},
				{"id": 3, "first_name": "Leslie", "last_name": "Knope"}
			]);
		}));

		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		var students;
		beforeEach(inject(function(studentAccessors) {
			runs(function() {
				studentAccessors.allStudents().then(function(collection) {
					students = collection;
				});
				$httpBackend.flush();
			});

			// TODO: remove message and timeout when working. flush call should make it a guaranteed return
			waitsFor(function() {
				return !_.isUndefined(students);
			}, 'student accessor', 500);
		}));

		it('returns a promise for a Collection', function() {
			expect(students.models).toBeDefined();
		});

		it('always returns the same Collection reference', function(){
			var secondResponse;
			runs(function() {
				allStudents().then(function(collection) {
					secondResponse = collection;
					expect(secondResponse).toBe(students);
				});
			});

			// TODO: remove message and timeout when working. flush call should make it a guaranteed return
			waitsFor(function() {
				return !_.isUndefined(secondResponse);
			}, 'student accessor', 500);
		});

		it('has length of 2', function() {
			expect(students.length).toBe(2);
		});

		it('sorts models by first then last name', function() {
			expect(students.models[0].get('last_name')).toBe('Knope');
			expect(students.models[1].get('last_name')).toBe('Nielsen');
			expect(students.models[2].get('last_name')).toBe('Swanson');
		});
	});
});
