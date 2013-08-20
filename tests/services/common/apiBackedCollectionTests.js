describe("APIBackedCollection", function() {
    describe("instance", function() {
        var collection;
        beforeEach(inject(function(APIBackedCollection) {
            collection = new APIBackedCollection();
        }));

        // TODO: add specs that actually show behavior of these functions, after $http fix
        it('.isSyncInProgress', inject(function(_) {
            expect(_.isFunction(collection.isSyncInProgress)).toBe(true);
        }));

        it('.lastSyncedAt', inject(function(_) {
            expect(_.isFunction(collection.lastSyncedAt)).toBe(true);
        }));
    });
});
