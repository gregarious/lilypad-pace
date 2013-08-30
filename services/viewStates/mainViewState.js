/**
 * Service that tracks app-wide view state variables.
 *
 * Primarily tracks the currently selected student in the app sidebar.
 * When this student changes, the service object will trigger a
 * 'change:selectedStudent' event on itself.
 *
 * Also tracks whether attendance is being taken. No need for an event
 * trigger here, so it's a simple variable.
 */
angular.module('pace').factory('mainViewState', function(_, Backbone) {
    var mainViewState = {};

    // don't give public access to bare selectedStudent, wrap in get/setters
    // so we can trigger events on value change
    var _selectedStudent = null;

    mainViewState.getSelectedStudent = function() {
        return _selectedStudent;
    };

    mainViewState.setSelectedStudent = function(student) {
        _selectedStudent = student;
        mainViewState.trigger('change:selectedStudent', _selectedStudent);
    };

    // simple variable for attendance.
    mainViewState.editingAttendance = false;

    _.extend(mainViewState, Backbone.Events);

    return mainViewState;
});
