describe("appViewState", function() {
    // set up mock student store
    var studentA, studentB;
    beforeEach(inject(function(APIBackedCollection, Student, studentAccessors) {
        studentA = new Student({id: 1, firstName: 'Leslie'});
        studentB = new Student({id: 2, firstName: 'Ron'});
        var mockAllStudents = new APIBackedCollection([studentA, studentB]);
        spyOn(studentAccessors, 'allStudents').andReturn(mockAllStudents);
    }));

    describe('.selectedStudent', function() {
        describe('.get', function() {
            it('defaults to null', inject(function(appViewState) {
                expect(appViewState.selectedStudent.get()).toBeNull();
            }));
        });

        describe('.set', function() {
            var changeTriggered;
            beforeEach(inject(function(appViewState) {
                changeTriggered = false;
                appViewState.selectedStudent.on('change', function() {
                    changeTriggered = true;
                });

                appViewState.selectedStudent.set(studentA);
            }));

            it('changes .getSelectedStudent value', inject(function(appViewState) {
                expect(appViewState.selectedStudent.get()).toBe(studentA);
            }));

            it("triggers 'change' event", function() {
                expect(changeTriggered).toBe(true);
            });
        });
    });
});
