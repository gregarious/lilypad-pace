angular.module('pace').factory('studentDataStore', function(Backbone, Student, timeTracker) {

    function classroomStudentsFactory(classroom) {
        var ClassroomStudentCollection = Backbone.Collection.extend({
            model: Student,

            url: function() {
                // add the query arg to get back active_attendance_span subresources
                return '/pace/classrooms/' + classroom.id + '/students/?attendance_anchor=' + timeTracker.getTimestampAsMoment().format();
            },

            comparator: function(student) {
                var first = student.get('firstName') || '';
                var last = student.get('lastName') || '';
                return (first+last).toLowerCase();
            }
        });

        return new ClassroomStudentCollection();
    }

    // cached collections
    var cache = {};

    /** Public interface of service **/
    return {
        getForClassroom: function(classroom) {
            var students = cache[classroom.id];
            if (!students) {
                students = cache[classroom.id] = classroomStudentsFactory(classroom);
                students.fetch();
            }
            return students;
        }
    };
});

