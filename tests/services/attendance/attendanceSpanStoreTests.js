describe("attendanceSpanStore", function() {
	// TODO: write specs once $http problem is sorted out
	xdescribe(".getForStudent", function() {
		var student, spans;
		beforeEach(inject(function(attendanceSpanStore) {
			student = new Student({id: 4});
			spans = attendanceSpanStore.getForStudent(student);
		}));

		// expect ordering by date then time
	});
});
