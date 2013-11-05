/**
 * Manages collections of DiscussionPosts.
 *
 * Interface:
 * - getForStudent: Returns a Student-specific collection of DiscussionPosts
 */


angular.module('pace').factory('discussionDataStore', function(DiscussionPost) {
    // cache indexed by student
    var cache = {};

    return {
        getForStudent: getForStudent
    };


    function getForStudent(student) {
        var collection = cache[student.id];
        if (!collection) {
            collection = cache[student.id] = studentPostsFactory(student);
            collection.fetch();
        }
        return collection;
    }

    /**
     * Returns a new Collection of DiscussionPost models for a student,
     * sorted by createdAt timestamp
     *
     * @param  {Student} student    (must have `postsUrl attribute defined)
     *
     * @return {Collection instance}
     */
    function studentPostsFactory(student) {
        var StudentPostCollection = Backbone.Collection.extend({
            model: DiscussionPost,
            url: student.get('postsUrl'),

            comparator: function(post) {
                if (post.has('createdAt')) {
                    return -post.get('createdAt');
                }
                else {
                    return Infinity;
                }
            },

            /**
             * Wrapper around Collection.create with student fixed. Don't
             * use create directly.
             *
             * @param  {String}  content
             * @param  {String}  author         (will become User object soon)
             * @param  {Object} options         Typical Backbone.create options
             *
             * @return {Post}
             */
            createNewPost: function(content, author, options) {
                var post = this.create({
                    student: student,
                    author: author,
                    content: content
                }, options);

                // don't want to POST this to server, but just set it
                // client-side now while the async call is in progress
                post.set('createdAt', timeTracker.getTimestamp());
                // manually sort: apparently setting createdAt after adding doesn't trigger sorting?
                this.sort();

                return post;
            }
        });

        return new StudentPostCollection();
    }
});