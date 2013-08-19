angular.module('pace').factory('discussionAccessors', function(StudentPostCollection, $q) {
    // StudentPostCollection cache
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

        var deferred = $q.defer();
        if (refresh) {
            // TODO: revisit the non-destructive nature of the fetch
            studentPostsStore[student.id].fetch({
                remove: false,
                success: function(collection, resp, options) {
                    deferred.resolve(collection);
                },
                error: function(collection, resp, options) {
                    deferred.reject(resp);
                }
            });
        }
        else {
            deferred.resolve(studentPostsStore[student.id]);
        }

        return deferred.promise;
    };

    /** Public interface of service **/

    // expose the student accessor function
    return {
        studentPosts: studentPosts
    };
});
