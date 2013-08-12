describe("DiscussionPost", function() {
    var post;
    beforeEach(inject(function(DiscussionPost) {
        post = new DiscussionPost();
    }));

    describe('constructor', function() {
        it("defaults `replies` to an empty Collection of DiscussionReply models", inject(function(DiscussionReply) {
            var replies = post.get('replies');
            expect(post.get('replies').model).toBe(DiscussionReply);
        }));
    });

    describe('.parse', function() {
        var response;
        beforeEach(function() {
            var responseJSON = {
                "author": "someone",
                "student": {
                    "id": 99
                },
                "created_at": "2013-01-01T12:00:00Z",
                "content": "Words words words"
            };
            response = post.parse(responseJSON);
        });
        
        it("converts student to a Student stub instance", inject(function(Student) {
            expect(response.student.constructor).toBe(Student);
        }));

        it("converts createdAt to a Date object", function() {
            expect(response.createdAt).toEqual(moment('2013-01-01T12:00:00Z').toDate());
        });
    });

    describe('.createNewReply', function() {
        var newReply;
        beforeEach(function() {
            newReply = post.createNewReply('simple', 'More new words');
        });

        it('creates new reply object', inject(function(DiscussionReply) {
            expect(newReply.constructor).toBe(DiscussionReply);
        }));

        it('adds new object to `replies`', function() {
            expect(post.get('replies')).toContain(newReply);
        });

        // TODO: future specs:
        // - spy on sync and ensure POST happens
        // - ensure createdAt gets set to a sane value (by mocking clock) even if server is down
    });
});
