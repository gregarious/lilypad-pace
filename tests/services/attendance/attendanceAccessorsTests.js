describe("attendanceAccessors", function() {
	// TODO: write specs once $http problem is sorted out
	xdescribe(".studentHistory", function() {
		var student, spans;
		beforeEach(inject(function(attendanceAccessors) {
			student = new Student({id: 4});
			spans = attendanceAccessors.spansForStudent(student);
		}));

		// expect spans to fetch from particular url
		// expect ordering by date then time
	});
});
