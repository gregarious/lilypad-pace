angular.module('pace').factory('classroomDataStore', function(Backbone, Classroom) {

    var AllClassroomCollection = Backbone.Collection.extend({
        model: Classroom,
        url: '/pace/classrooms/',
        comparator: 'name',
    });

    // cached collection
    var allClassrooms = new AllClassroomCollection();

    /** Public interface of service **/
    return {
        getAll: function(options) {
            allClassrooms.fetch(options);
            return allClassrooms;
        }
    };
});
