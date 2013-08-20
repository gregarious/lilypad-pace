angular.module('pace').factory('APIBackedCollection', function(Backbone) {
    return Backbone.Collection.extend({
        isSyncInProgress: function() {
            return false;
        },

        lastSyncedAt: function() {
            return null;
        }
    });
});
