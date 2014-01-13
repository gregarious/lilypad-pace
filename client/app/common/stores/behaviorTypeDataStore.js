angular.module('pace').service('behaviorTypeDataStore', function(Backbone, $q, BehaviorIncidentType, apiConfig) {
    var BehaviorTypeCollection = Backbone.Collection.extend({
        model: BehaviorIncidentType,
        url: apiConfig.toAPIUrl('behaviortypes/'),
        comparator: 'label',
    });

    var allTypes = new BehaviorTypeCollection();

    return {
        isSynced: false,

        loadAllTypes: function() {
            var deferred = $q.defer();

            var self = this;
            allTypes.fetch({
                success: function(collection) {
                    self.isSynced = true;
                    deferred.resolve(collection);
                },
                error: function(err) {
                    deferred.reject(err);
                }
            });
            return deferred.promise;
        },

        /**
         * Returns a Collection of student-specific behavior types.
         *
         * @param  {[type]} student [description]
         * @return {[type]}         [description]
         */
        getForStudent: function(student) {
            if (!this.isSynced) {
                console.warn('BehaviorTypeDataStore must be loaded before getting student data');
                return null;
            }
            else {
                // extend the behavior type collection to have create inject the student
                var StudentSpecificCollection = BehaviorTypeCollection.extend({
                    create: function(attributes, options) {
                        attributes.applicableStudent = student;
                        return Backbone.Collection.prototype.create.call(this, attributes, options);
                    }
                });

                var models = allTypes.filter(function(behaviorType) {
                    var appStudent = behaviorType.get('applicableStudent');
                    // also return types that are not student-specific
                    return !appStudent || appStudent === student;
                });
                return new StudentSpecificCollection(models);
            }
        }
    };
});
