angular.module('pace').service('behaviorIncidentTypeDataStore', function(BehaviorIncidentType, $q, apiConfig) {

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

        var baseUrl = 'students/' + student.id + "/behaviortypes/";

        var BehaviorTypeCollection = Backbone.Collection.extend({
            model: BehaviorIncidentType,
            url: apiConfig.toAPIUrl(baseUrl),
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

        var deferred = $q.defer();
        studentTypesFactory(student).fetch({
            success: function(collection) {
                cache[student.id] = collection;
                deferred.resolve(collection);
            },
            error: function(err) {
                deferred.reject(err);
            }
        });

        promiseCache[student.id] = deferred.promise;
        return deferred.promise;
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
        // refactor this around being a StudentCollection #refactor
        var attrs = {
            label: label,
            supportsDuration: supportsDuration,
            code: code || '',
            applicableStudent: student
        };

        var newType = BehaviorIncidentType.findOrCreate(attrs);
        newType.save();

        // if there's already a collection for the given student, manually add the new instance
        if (student && cache[student.id]) {
            cache[student.id].add(newType);
        }
        return newType;
    };
});
