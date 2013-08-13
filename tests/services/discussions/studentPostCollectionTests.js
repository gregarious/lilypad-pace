describe("StudentPostCollection", function() {
    // set up some values to be used in specs below
    var student;
    beforeEach(inject(function(Student) {
        student = new Student({
            id: 4,
            postsUrl: '/pace/students/4/posts/'
        });
    }));

    describe("constructor", function() {
        it("should fail if called with no student", inject(function(StudentPostCollection) {
            var newCall = function() {
                new StudentPostCollection();
            };
            expect(newCall).toThrow();
        }));
    });

    describe("instance", function() {
        var collection;
        beforeEach(inject(function(StudentPostCollection) {
            // mock out syncing for now
            spyOn(Backbone, 'sync');

            collection = new StudentPostCollection([], {
                student: student
            });
        }));

        describe('.url', function() {
            it('should return expected url', function() {
                expect(collection.url()).toBe('/pace/students/4/posts/');
            });
        });

        describe('.createPeriodicRecord', function() {
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
    });
});
