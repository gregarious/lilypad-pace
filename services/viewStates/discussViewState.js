angular.module('pace').factory('discussViewState', function(_, Backbone, APIBackedCollection, mainViewState, discussionPostStore) {
    var discussViewState = {
        collection: new APIBackedCollection()
    };

    mainViewState.on('change:selectedStudent', function(newSelected) {
        discussViewState.collection = discussionPostStore.getForStudent(newSelected);
    });

    return discussViewState;
});