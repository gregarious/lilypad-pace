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
    mainViewState._selectedStudent = null;

    mainViewState.isStudentSelected = function() {
        return Boolean(mainViewState._selectedStudent);
    };

    mainViewState.getSelectedStudent = function() {
        return mainViewState._selectedStudent;
    };

    mainViewState.setSelectedStudent = function(student) {
        mainViewState._selectedStudent = student;
        mainViewState.trigger('change:selectedStudent', student);
    };

    // same observable setup as for selected student above
    var _selectedClassroom = null;

    mainViewState.isClassroomSelected = function() {
        return Boolean(_selectedClassroom);
    };

    mainViewState.getSelectedClassroom = function() {
        return _selectedClassroom;
    };

    mainViewState.setSelectedClassroom = function(student) {
        _selectedClassroom = student;
        mainViewState.trigger('change:selectedClassroom', _selectedClassroom);
    };

    // simple variable for attendance.
    mainViewState.editingAttendance = false;

    _.extend(mainViewState, Backbone.Events);

    return mainViewState;
});
