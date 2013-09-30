angular.module('pace').factory('studentDataStore', function(Backbone, Student, timeTracker) {
    var studentStore = new Backbone.PersistentStore(Student, 'Students');

    var AllStudentCollection = Backbone.Collection.extend({
        model: Student,
        dataStore: studentStore,
        storeFilter: function(m) {
            return true;
        },

        url: function() {
            // add the query arg to get back active_attendance_span subresources
            return '/pace/students/?attendance_anchor=' + timeTracker.getTimestampAsMoment().format();
        },
        comparator: function(student) {
            var first = student.get('firstName') || '';
            var last = student.get('lastName') || '';
            return (first+last).toLowerCase();
        }
    });

    var allStudents = _g = new AllStudentCollection();
    /** Public interface of service **/
    return {
        getAllStudents: function(options) {
            allStudents.fetch();
            return allStudents;
        }
    };
});
