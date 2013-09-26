angular.module('pace').factory('studentDataStore', function(Backbone, Student, timeTracker, $q) {
    var StudentCollection = Backbone.PersistentCollection.extend({
        model: Student,
        localStorage: new Backbone.LocalStorage("AllStudents"),
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

    /** Public interface of service **/
    return {
        getAllStudents: function(options) {
            var students = new StudentCollection();
            students.fetch();
            return students;
        }
    };
});
