angular.module('pace').factory('APIBackedCollection', function(Backbone) {
    return Backbone.Collection.extend({
        isSyncInProgress: false,
        lastSyncedAt: null,

        sync: function(method, collection, options) {
            var httpPromise = Backbone.Collection.prototype.sync.apply(this, arguments);
            var collection = this;
            collection.isSyncInProgress = true;
            httpPromise.always(function() {
                collection.isSyncInProgress = false;
                collection.lastSyncedAt = new Date();
            });
            return httpPromise;
        }
    });
});
