// TODO: re-enable (and reconfigure for promises) once I figure out why we're having trouble with $http
xdescribe("discussionAccessors", function() {
    describe(".studentPosts", function() {
        var student, dateString, studentPosts, posts;
        beforeEach(inject(function(Student, discussionAccessors) {
            studentPosts = discussionAccessors.studentPosts;

            // mock out syncing for now
            spyOn(Backbone, 'sync');

            student = new Student({id: 4});
            posts = studentPosts(student);
        }));

        it('returns a StudentPostCollection with expected settings', inject(function(StudentPostCollection) {
            expect(posts.constructor).toBe(StudentPostCollection);
            expect(posts._student).toBe(student);
        }));

        it('returns the same collection instance when called twice', function() {
            var posts2 = studentPosts(student);
            expect(posts).toBe(posts2);
        });
    });
});
