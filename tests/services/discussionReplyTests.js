describe("DiscussionReply", function() {
    var reply;
    beforeEach(inject(function(DiscussionReply) {
        reply = new DiscussionReply();
    }));

    describe('.parse', function() {
        var response;
        beforeEach(function() {
            var responseJSON = {
                "author": "someone",
                "created_at": "2013-01-01T12:00:00Z",
                "content": "first!"
            };
            response = reply.parse(responseJSON);
        });
        
        it("converts created_at to a Date object", function() {
            expect(response.createdAt).toEqual(moment('2013-01-01T12:00:00Z').toDate());
        });
    });
});
