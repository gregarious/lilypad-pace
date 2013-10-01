angular.module('pace').service('behaviorIncidentTypeDataStore', function(BehaviorIncidentType) {
    // cache indexed by student id
    var cache = {};

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

            dataStore: new Backbone.PersistentStore(BehaviorIncidentType, "BehaviorTypes-" + student.id),
            storeFilter: function(typeModel) {
                return (!typeModel.has('applicableStudent') ||
                         typeModel.get('applicableStudent').id === student.id);
            }
        });

        return new BehaviorTypeCollection();
    };

    /**
     * Returns a Collection of BehaviorIncidentTypes applicable
     * to the given student. This includes both custom types only defined
     * for the student, as well as types common across all students.
     *
     * @param  {Student} student
     * @return {Collection}
     */
    this.getTypesForStudent = function(student, options) {
        var collection = cache[student.id];
        if (!collection) {
            cache[student.id] = collection = studentTypesFactory(student);
        }
        collection.fetch(options);
        return collection;
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
