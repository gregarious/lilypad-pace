angular.module('pace').factory('DiscussionPost', function(Backbone, moment, timeTracker, Student, DiscussionReply, apiConfig) {
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
        urlRoot: apiConfig.toAPIUrl('posts/'),

        initialize: function() {
            // if no replies passed in, create a new Collection for them
            if (!this.has('replies')) {
                this.set('replies', new ReplyCollection());
            }
        },

        parse: function(response, options) {
            // handle createdAt Date deserialization, and create lightweight
            // collection of ReplyPost models from replies
            // TODO: handle author deserialization when User model in place

            response = Backbone.Model.prototype.parse.apply(this, arguments);
            response.createdAt = moment(response.createdAt).toDate();

            // necessary to manually change inner object case, recursive support doesn't exist right now
            _.each(response.replies, function(replyJSON) {
                if (replyJSON.created_at) {
                    replyJSON.createdAt = replyJSON.created_at;
                    delete replyJSON.created_at;
                }
            });

            response.replies = new ReplyCollection(response.replies);
            return response;
        },

        /**
         * Creates a new ReplyPost and hooks it up to the Collection living
         * in this Post's `replies`. Doesn't currently POST.
         */
        createNewReply: function(content, author) {
            var newReply = new DiscussionReply({
                author: author,
                content: content
            });

            // don't want to POST this to server, but just set it
            // client-side now while the async call is in progress
            newReply.set('createdAt', timeTracker.getTimestamp());

            // TODO: hook this up to POST endpoint; card #82

            this.get('replies').add(newReply);
            return newReply;
        }
    });
});
