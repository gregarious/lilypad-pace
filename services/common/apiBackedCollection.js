angular.module('pace').factory('APIBackedCollection', function(Backbone) {
    return Backbone.Collection.extend({
        isSyncInProgress: false,
        lastSyncedAt: null,

        sync: function(method, collection, options) {
            var httpPromise = Backbone.Collection.prototype.sync.apply(this, arguments);
            this.isSyncInProgress = true;
            httpPromise.always(function() {
                this.isSyncInProgress = false;
                this.lastSyncedAt = new Date();
            });
            return httpPromise;
        }
    });
});
