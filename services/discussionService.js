angular.module('pace').service('discussionService', function(Backbone, moment, studentService) {
    var Post = Backbone.Model.extend({
        /*
            Attributes:
                id : String
                url : String
                author : String (will later be User model)
                student : Student
                createdAt : Date
                content : String
                replies : Collection of PostReply models
         */
        urlRoot: '/pace/posts/',

        defaults: {
            replies: new Backbone.Collection()
        },

        parse: function(response, options) {
            // transform student stub dict into Student model, handle 
            // createdAt Date deserialization, and create lightweight 
            // collection of ReplyPost models from replies
            // TODO: handle author deserialization when User model in place

            response = Backbone.Model.prototype.parse.apply(this, arguments);
            response.student = new studentService.Student(response.student);
            response.createdAt = moment(response.createdAt).toDate();

            var ReplyCollection = Backbone.Collection.extend({'model': ReplyPost});
            response.replies = new ReplyCollection(response.replies);
            return response;
        },

        createNewReply: function(author, content) {
            var newReply = new ReplyPost({
                author: author,
                content: content
            });

            // don't want to POST this to server, but just set it
            // client-side now while the async call is in progress
            newReply.set('createdAt', new Date());
            
            // TODO: hook this up to POST endpoint
            
            this.get('replies').add(newReply);
            return newReply;
        }
    });

    var ReplyPost = Backbone.Model.extend({
        /*
            Note: this model has no API endpoint. Always nested in Post object.

            Attributes:
                author : String (will later be User model)
                createdAt : Date
                content : String
         */
        parse: function(response, options) {
            // only need to handle Date deserialization
            // TODO: handle author deserialization when User model in place
            response = Backbone.Model.prototype.parse.apply(this, arguments);
            response.createdAt = moment(response.createdAt).toDate();
            return response;
        }
    });
       
    // Collection returned by studentPosts.
    var StudentPostCollection = Backbone.Collection.extend({
        model: Post,

        /**
         * Collection must be initialized with an options dict that
         * includes `student`.
         */
        initialize: function(models, options) {
            this._student = options.student;
        },

        url: function() {
            return this._student.get('postsUrl');
        },

        /**
         * Wrapper around Collection.create that inserts student and date into
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

    // StudentPostCollection store
    var studentPostsStore = {};
    /**
     * Returns a StudentPostCollection with models for the 
     * given student.
     * 
     * @param  {Student} student
     * @param  {String} options       if {refresh: true} in options, a fetch
     *                                will be performed when the collection
     *                                already exists.
     * 
     * @return {StudentPostCollection}
     */
    var studentPosts = function(student, options) {
        var refresh = options && options.refresh;
        if (!studentPostsStore[student.id]) {
            studentPostsStore[student.id] = new StudentPostCollection([], {
                student: student
            });
            refresh = true;
        }
        if (refresh) {
            // TODO: revisit the non-destructive nature of the fetch
            studentPostsStore[student.id].fetch({remove: false});
        }
        return studentPostsStore[student.id];
    };

    /** Public interface of service **/

    // expose the student accessor function
    this.studentPosts = studentPosts;
});
