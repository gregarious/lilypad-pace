describe("attendanceDataStore", function() {
	// TODO: write specs once $http problem is sorted out
	xdescribe(".getForStudent", function() {
		var student, spans;
		beforeEach(inject(function(attendanceDataStore) {
			student = new Student({id: 4});
			spans = attendanceDataStore.getForStudent(student);
		}));

		// expect ordering by date then time
	});
});
