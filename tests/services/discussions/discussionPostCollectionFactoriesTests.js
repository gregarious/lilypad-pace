describe("discussionPostCollectionFactories", function() {
    describe(".studentPosts", function() {
        // set up some values to be used in specs below
        var student;
        beforeEach(inject(function(Student) {
            student = new Student({
                id: 4,
                postsUrl: '/p/4/'
            });
        }));

        describe("instance", function() {
            var collection;
            beforeEach(inject(function(discussionPostCollectionFactories) {
                // mock out syncing for now
                spyOn(Backbone, 'sync');
                collection = discussionPostCollectionFactories.studentPosts(student);
            }));

            describe('.createNewPost', function() {
                beforeEach(function() {
                    spyOn(collection, 'create').andCallThrough();
                });

                it('defers to .create', function() {
                    var newPost = collection.createNewPost('New Post', 'me');
                    expect(collection.create).toHaveBeenCalled();
                    // sanity check, just ensure model is in collection
                    expect(collection).toContain(newPost);
                });

                it('creates an instance with expected student', function() {
                    var newPost = collection.createNewPost('New Post', 'me');
                    expect(newPost.get('student')).toBe(student);
                });

                // TODO: future specs:
                // - ensure createdAt gets set to a sane value (by mocking clock) even if server is down
            });

            it('should sort by date created', inject(function(DiscussionPost) {
                collection.add(new DiscussionPost({
                    id: 1,
                    content: 'second',
                    createdAt: new Date(2013, 0, 2, 12, 0, 0)
                }));
                collection.add(new DiscussionPost({
                    id: 2,
                    content: 'first',
                    createdAt: new Date(2013, 0, 1, 12, 0, 0)
                }));

                expect(collection.models[0].get('content')).toBe('first');
                expect(collection.models[1].get('content')).toBe('second');
            }));
        });
    });
});
