/**
 * App startup code. Sets up initial view state, global functions, and
 * and attempts to resume user session.
 */
angular.module('pace').run(function(sessionManager, $rootScope, mixpanel, behaviorTypeDataStore) {
     // create and initializes the global `viewState` object to
     // manage app-wide variables necessary to maintain view state.
    $rootScope.viewState = $rootScope.viewState || {};

    // initialize view state at app load
    $rootScope.viewState = {
        isUserAuthenticated: false,
        editingAttendance: false,

        selectedStudent: null,
        selectedClassroom: null,
        selectedPeriod: null,

        isStudentSelected: function() {
            return Boolean(this.selectedStudent);
        },
        isClassroomSelected: function() {
            return Boolean(this.selectedClassroom);
        },

        schoolDayEnded: function() {
            var d = timeTracker.getTimestamp();

            // if after 3 pm
            if (d.getHours() >= 15) {
                return true;
            } else {
                return false;
            }
        }
    };

    // global function for granting access to a user. needed both here
    // and in login controller, so just putting it on $rootScope.
    // Assumes that sessionManager has a `username` value defined on it.
    $rootScope.grantAccess = function() {
        var username = sessionManager.getValue('username');
        mixpanel.identify(username);
        mixpanel.people.set({ $username: username });

        $rootScope.viewState.isUserAuthenticated = true;

        // TODO: move this into post-authenication start up routine to give
        //       user feedback if case this call fails
        behaviorTypeDataStore.loadAllTypes();
    };

    $rootScope.revokeAccess = function() {
        // reset main view state values
        $rootScope.viewState.isUserAuthenticated = false;
        $rootScope.viewState.selectedStudent = null;
        $rootScope.viewState.selectedClassroom = null;
    };

    // Now app is configured and running. Kick it off by trying
    // to resume an existing session

    var didResume = sessionManager.resumeSession();
    if (didResume) {
        $rootScope.grantAccess();
    }
});
