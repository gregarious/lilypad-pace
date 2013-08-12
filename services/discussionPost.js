angular.module('pace').factory('DiscussionPost', function(Backbone, moment, Student, DiscussionReply) {
    var ReplyCollection = Backbone.Collection.extend({'model': DiscussionReply});
    
    return Backbone.Model.extend({
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
            replies: new ReplyCollection
        },

        parse: function(response, options) {
            // transform student stub dict into Student model, handle 
            // createdAt Date deserialization, and create lightweight 
            // collection of ReplyPost models from replies
            // TODO: handle author deserialization when User model in place

            response = Backbone.Model.prototype.parse.apply(this, arguments);
            response.student = new Student(response.student);
            response.createdAt = moment(response.createdAt).toDate();

            response.replies = new ReplyCollection(response.replies);
            return response;
        },

        /**
         * Creates a new ReplyPost and hooks it up to the Collection living
         * in this Post's `replies`. Doesn't currently POST.
         */
        createNewReply: function(author, content, options) {
            var newReply = new DiscussionReply({
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
});
