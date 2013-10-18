angular.module('pace').service('behaviorIncidentTypeDataStore', function(BehaviorIncidentType, $q) {

    // Collection of app-wide canonical BehaviorIncidentType models
    var typeRegistry = _tr = new (Backbone.Collection.extend({
        model: BehaviorIncidentType,
        url: '/pace/behaviortypes/'
    }))();
    var updateRegistry = function(model) {
        var registryModel = typeRegistry.get(model);
        if (registryModel) {
            typeRegistry.add(model, {merge: true});
        }
    };

    // Re-enable this when needing general behavior types
    // var initializePromise = null;
    // this.initializeRegistry = function() {
    //     if (!initializePromise) {
    //         var deferred = $q.defer();
    //         typeRegistry.fetch(function(collection) {
    //             deferred.resolve(collection);
    //         }, function(err) {
    //             deferred.reject(err);
    //         });

    //         initializePromise = deferred.promise;
    //     }
    //     return initializePromise;
    // };

    // cache indexed by student id
    var cache = {};
    var promiseCache = {};

    /**
     * Returns a new Collection of BehaviorIncidentType for a given
     * student.
     *
     * @param  {Student} student    (must have `behaviorTypesUrl` defined)
     * @return {Collection}
     */
    var studentTypesFactory = function(student) {
        if (!student || _.isUndefined(student.id)) {
            throw Error("Valid student instance is required.");
        }

        var BehaviorTypeCollection = Backbone.Collection.extend({
            model: BehaviorIncidentType,
            url: student.get('behaviorTypesUrl'),
        });

        return new BehaviorTypeCollection();
    };

    /**
     * Returns a promise for a Collection of BehaviorIncidentTypes applicable
     * to the given student. This includes both custom types only defined
     * for the student, as well as types common across all students.
     *
     * @param  {Student} student
     * @return {Promise}
     */
    this.getTypesForStudent = function(student) {
        var oldPromise = promiseCache[student.id];
        if (oldPromise) {
            return oldPromise;
        }

        // don't want to directly return response models from server. instead, we
        // go through them and add/merge them with the registry and return the
        // registry models. that way all BehaviorIncidentType models are canonical
        // app-wide
        var serverCollection = studentTypesFactory(student);
        var deferred = $q.defer();
        serverCollection.fetch(function(serverCollection) {
            var registryModels = typeRegistry.add(serverCollection.models, {merge: true});
            var collection = new Backbone.Collection(registryModels);
            cache[student.id] = collection;
            deferred.resolve(collection);
        }, function(err) {
            deferred.reject(err);
        });

        promiseCache[student.id] = deferred.promise;
        return deferred.promise;
    };

    /**
     * Either return an existing model from the registry matching
     * the input model/attributeObj `id` or create a new one. If
     * {merge: true} is passed as an option, the registry values
     * will be merged with the given model (passes through to
     * Collection.add).
     */
    this.findOrRegister = function(model, options) {
        return typeRegistry.add(model, options);
    };

    /**
     * Creates a custom new incident type for a student.
     * @param  {String} label
     * @param  {String} supportsDuration (default: false)
     * @param  {String} code             (optional)
     * @param  {Student} student
     * @return {BehaviorIncidentType}
     */
    this.createIncidentType = function(label, supportsDuration, code, student) {
        // TODO: refactor this around being a StudentCollection
        var attrs = {
            label: label,
            supportsDuration: supportsDuration,
            code: code || '',
            applicableStudent: student
        };

        // if there's already a collection for the given student, use it to
        // create the new instance
        if (student && cache[student.id]) {
            return cache[student.id].create(attrs);
        }
        else {
            var newType = new BehaviorIncidentType(attrs);
            newType.save();
            return newType;
        }
    };
});
