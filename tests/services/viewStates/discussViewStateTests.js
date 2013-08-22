describe('discussViewState', function() {
    // set up mock Student, DiscussionPost stores
    var studentA, postsA;
    beforeEach(inject(function(APIBackedCollection, Student, studentAccessors, discussionPostStore) {
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

        postsA = new APIBackedCollection();
        spyOn(discussionPostStore, 'getForStudent').andReturn(postsA);
    }));

    describe('.posts', function() {
        it('collection defaults to an empty Collection', inject(function(discussViewState) {
            expect(discussViewState.collection.length).toBe(0);
        }));

        it('updates on student change', inject(function(mainViewState, discussViewState) {
            mainViewState.setSelectedStudent(studentA);
            expect(discussViewState.collection).toBe(postsA);
        }));
    });
});
