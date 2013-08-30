angular.module('pace').factory('studentDataStore', function(Backbone, Student, timeTracker, $q) {
    var StudentCollection = Backbone.Collection.extend({
        model: Student,
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

    var _getAllStudents = new StudentCollection();

    /** Public interface of service **/
    return {
        getAllStudents: function(options) {
            _getAllStudents.fetch();
            return _getAllStudents;
        }
    };
});
