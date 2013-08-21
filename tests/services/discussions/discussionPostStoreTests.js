// TODO: re-enable (and reconfigure for promises) once I figure out why we're having trouble with $http
describe('discussionPostStore', function() {
    describe(".getForStudent", function() {
        var student, dateString, studentPosts, posts;
        beforeEach(inject(function(Student) {
            student = new Student({
                id: 4,
                postsUrl: '/p'
            });
        }));

        describe("on first access", function() {
            var posts;
            beforeEach(inject(function(discussionPostStore) {
                posts = discussionPostStore.getForStudent(student);
            }));

            it("returns an empty Collection", function() {
                expect(posts.models.length).toBe(0);
            });

            it("returns a Collection with its first sync in progress", function() {
                expect(posts.lastSyncedAt).toBe(null);
                expect(posts.isSyncInProgress).toBe(true);
            });
        });

        xdescribe("after collection syncs", function() {
            var posts;
            beforeEach(inject(function(discussionPostStore) {
                posts = discussionPostStore.getForStudent(student);
            }));

            describe("on subsequent accesses", function() {
                var posts2;
                beforeEach(inject(function(discussionPostStore) {
                    // flush $http
                    posts2 = discussionPostStore.getForStudent(student);
                }));

                it("returns the same collection", function() {
                    expect(posts2).toBe(posts);
                });

                it("does not automatically sync again", function() {
                    expect(posts2.isSyncInProgress()).toBe(false);
                });
            });
        });
    });
});
