/**
 * Provides factories to create new Collections of post objects
 */
angular.module('pace').factory('discussionPostCollectionFactories', function(APIBackedCollection, DiscussionPost) {
    /**
     * Returns a new Collection of DiscussionPost models for a student,
     * sorted by createdAt timestamp
     *
     * @param  {Student} student    (must have `postsUrl attribute defined)
     *
     * @return {Collection instance}
     */
    return {
        studentPosts: function(student) {
            var StudentPostCollection = APIBackedCollection.extend({
                model: DiscussionPost,
                url: student.get('postsUrl'),
                comparator: 'createdAt',

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
                    post.set('createdAt', new Date());
                    return post;
                }
            });
            return new StudentPostCollection();
        }
    };
});
