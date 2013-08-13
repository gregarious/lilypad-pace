angular.module('pace').factory('StudentPostCollection', function(Backbone, DiscussionPost) {
    return Backbone.Collection.extend({
        model: DiscussionPost,

        /**
         * Collection must be initialized with an options dict that
         * includes `student`.
         */
        initialize: function(models, options) {
            options = options || {};
            if (!options.student) {
                throw new Error("Constructor must be called with `student` in options hash");
            }
            this._student = options.student;
        },

        url: function() {
            return this._student.get('postsUrl');
        },

        /**
         * Wrapper around Collection.create that inserts student into 
         * attributes for new Model. Don't use create directly.
         * @param  {String}  content           
         * @param  {String}  author         (will become User object soon)
         * @param  {Object} options         Typical Backbone.create options
         * @return {Post}
         */
        createNewPost: function(content, author, options) {
            var post = this.create({
                student: this._student,
                author: author,
                content: content
            }, options);

            // don't want to POST this to server, but just set it
            // client-side now while the async call is in progress
            post.set('createdAt', new Date());
            return post;
        }
    });
});