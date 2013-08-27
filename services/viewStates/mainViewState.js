/**
 * Service that tracks app-wide view state variables.
 *
 * Primarily tracks the currently selected student in the app sidebar.
 * When this student changes, the service object will trigger a
 * 'change:selectedStudent' event on itself.
 */
angular.module('pace').factory('mainViewState', function(_, Backbone) {
    var mainViewState = {};
    var _selectedStudent = null;

    mainViewState.getSelectedStudent = function() {
        return _selectedStudent;
    };

    mainViewState.setSelectedStudent = function(student) {
        _selectedStudent = student;
        mainViewState.trigger('change:selectedStudent', _selectedStudent);
    };

    _.extend(mainViewState, Backbone.Events);

    return mainViewState;
});
