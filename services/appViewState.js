angular.module('pace').factory('appViewState', function(_, Backbone) {
    var _selectedStudent = null;

    var selectedStudent = {
        get: function() {
            return _selectedStudent;
        },
        set: function(student) {
            _selectedStudent = student;
            this.trigger('change');
        }
    };
    _.extend(selectedStudent, Backbone.Events);


    return {
        selectedStudent: selectedStudent
    };
});
