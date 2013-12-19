angular.module('pace')

.factory('Classroom', function(_, Backbone, Student, apiConfig) {
    return Backbone.RelationalModel.extend({
        urlRoot: apiConfig.toAPIUrl('classrooms/'),
        relations: [
            {
                key: 'students',
                relatedModel: Student,
                reverseRelation: {
                    key: 'classroom',
                    includeInJSON: false
                },
                type: Backbone.HasMany,
            }
        ],

        // server data will have nested student models that need camelCased
        parse: function(response, options) {
            var camelResponse = Backbone.RelationalModel.prototype.parse.apply(this, arguments);
            if (camelResponse.students) {
                camelResponse.students = _.map(camelResponse.students, Student.prototype.parse);
            }
            return camelResponse;
        }
    });
})

.factory('classroomDataStore', function(Backbone, Classroom, $q, apiConfig) {
    var ClassroomDataStore = Backbone.Collection.extend({
        model: Classroom,
        url: apiConfig.toAPIUrl('classrooms/'),
        comparator: 'name',

        /**
         * Wrapper around Backbone's fetch() call to return a promise for the
         * actual Collection, rather than the raw HttpPromise.
         *
         * @return {Promise}    Promise for a Collection
         */
        load: function() {
            var deferredCollection = $q.defer();
            this.fetch({
                success: function(collection) {
                    console.log(arguments);
                    deferredCollection.resolve(collection);
                },
                error: function(collection, response) {
                    deferredCollection.reject(response);
                }
            });
            return deferredCollection.promise;
        }
    });


    // return instance of the data store type to be used as app-wide singleton
    return new ClassroomDataStore();
});
