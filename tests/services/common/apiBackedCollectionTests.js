describe("APIBackedCollection", function() {
    describe("instance", function() {
        var collection;
        beforeEach(inject(function(APIBackedCollection) {
            collection = new (APIBackedCollection.extend({
                url: '/'
            }))();
        }));

        describe('initial settings', function() {
            it('.isSyncInProgress should be false', function() {
                expect(collection.isSyncInProgress).toBe(false);
            });
            it('.lastSyncedAt should be null', function() {
                expect(collection.lastSyncedAt).toBeNull();
            });
        });

        describe('immediately after fetch is called', function() {
            beforeEach(function() {
                collection.fetch();
            });

            it('.isSyncInProgress should be true', function() {
                expect(collection.isSyncInProgress).toBe(true);
            });
            it('.lastSyncedAt should be null', function() {
                expect(collection.lastSyncedAt).toBeNull();
            });
        });

        // TODO: after $http mocking works
        xdescribe('after fetch returns', function() {
            beforeEach(function() {
                collection.fetch();
                // TODO: http flush
            });

            it('.isSyncInProgress should be false', function() {
                expect(collection.isSyncInProgress).toBe(false);
            });
            it('.lastSyncedAt should be set', function() {
                expect(collection.lastSyncedAt).not.toBeNull();
            });
        });
    });
});
