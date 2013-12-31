/**
 * Service that tracks app-wide view state variables.
 */
angular.module('pace').factory('mainViewState', function(_, Backbone, $rootScope) {
    $rootScope.bigtest = 'hello';
    return {
        isUserAuthenticated: false,
        selectedStudent: null,
        selectedClassroom: null,
        isStudentSelected: function() {
            return Boolean(this.selectedStudent);
        },
        isClassroomSelected: function() {
            return Boolean(this.selectedClassroom);
        },

        editingAttendance: false
    };
});
