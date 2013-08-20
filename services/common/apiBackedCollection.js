angular.module('pace').factory('APIBackedCollection', function(Backbone) {
    return Backbone.Collection.extend({
        _isSyncInProgress: false,
        _lastSyncedAt: null,

        isSyncInProgress: function() {
            return this._isSyncInProgress;
        },

        lastSyncedAt: function() {
            return this._lastSyncedAt;
        },

        sync: function(method, collection, options) {
            var httpPromise = Backbone.Collection.prototype.sync.apply(this, arguments);
            this._isSyncInProgress = true;
            httpPromise.always(function() {
                this._isSyncInProgress = false;
                this._lastSyncedAt = new Date();
            });
            return httpPromise;
        }
    });
});
