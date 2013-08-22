describe("mainViewState", function() {
    // set up mock student store
    var studentA;
    beforeEach(inject(function(APIBackedCollection, Student, studentAccessors) {
        // TODO: don't like the dependency on an explicit url setting. put these in Model defs
        studentA = new Student({
            id: 1,
            periodicRecordsUrl: '/pr/1',
            behaviorIncidentsUrl: '/bi/1',
            pointLossesUrl: '/pl/1',
            postsUrl: '/po/1'
        });

        var mockAllStudents = new APIBackedCollection([studentA]);
        spyOn(studentAccessors, 'allStudents').andReturn(mockAllStudents);
    }));

    describe('.getSelectedStudent', function() {
        it('defaults to null', inject(function(mainViewState) {
            expect(mainViewState.getSelectedStudent()).toBeNull();
        }));
    });

    describe('.setSelectedStudent', function() {
        var changeTriggered;
        beforeEach(inject(function(mainViewState) {
            changeTriggered = false;
            mainViewState.on('change:selectedStudent', function() {
                changeTriggered = true;
            });

            mainViewState.setSelectedStudent(studentA);
        }));

        it('changes .getSelectedStudent value', inject(function(mainViewState) {
            expect(mainViewState.getSelectedStudent()).toBe(studentA);
        }));

        it("triggers 'change' event", function() {
            expect(changeTriggered).toBe(true);
        });
    });
});
