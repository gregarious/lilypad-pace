/**
 * Manages collections of DiscussionPosts.
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of DiscussionPosts
 */


angular.module('pace').factory('discussionPostStore', function(discussionPostCollectionFactories) {
    // StudentDiscussionPostCollection cache, indexed by student
    var cache = {};

    return {
        getForStudent: function(student) {
            var collection = cache[student.id];
            if (!collection) {
                collection = cache[student.id] = discussionPostCollectionFactories.studentPosts(student);
                collection.fetch();
            }
            return collection;
        }
    };
});
