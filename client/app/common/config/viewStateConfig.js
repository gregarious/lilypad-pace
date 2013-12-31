/**
 * Creates and initializes a `viewState` object on the `$rootScope` to
 * manage app-wide variables necessary to maintain view state.
 */
angular.module('pace').run(function($rootScope) {
    $rootScope.viewState = $rootScope.viewState || {};

    // initialize view state at app load
    $rootScope.viewState = {
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
