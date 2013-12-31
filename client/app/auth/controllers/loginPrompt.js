app.controller('LoginPromptCtrl', function ($scope, sessionManager, classroomDataStore, mixpanel, $timeout) {
    /** $scope interface **/

    $scope.loginData = {};

    $scope.logIn = logIn;

    // hook to root scope's `logOut` broadcast
    $scope.$on('logOut', function() {
        logOut();
    });


    var didResume = sessionManager.resumeSession();
    if (didResume) {
        startApp();
    }

    /** Implementation details **/

    function startApp() {
        mixpanel.identify(sessionManager.getValue('username'));
        $scope.viewState.isUserAuthenticated = true;

        // DEV: disabled temporarily
        // initializeClassroomList();
    }

    function logIn() {
        var data = $scope.loginData;
        if (data.username && data.password) {
            var attemptingLogin = sessionManager.authenticateFromServer(data.username, data.password);

            attemptingLogin.then(function() {
                sessionManager.setValue('username', data.username);
                startApp();
            }, function(errorInfo) {
                $scope.viewState.isUserAuthenticated = false;
                var reason = errorInfo[0];
                var statusCode = errorInfo[1];
                if (statusCode === 400) {
                    alert('Wrong username or password');
                }
                else {
                    alert('Problem contacting server. Try again later.');
                }
            });
        }
    }

    function logOut() {
        // wrap in immediately timeout as a work-around to mobile Safari
        // double-tap bug (see https://github.com/jquery/jquery-mobile/issues/4686)
        $timeout(function() {
            var confirmLogout = confirm("Are you sure you want to logout?");
            if (confirmLogout === true) {
                sessionManager.clearSession();

                // reset login form
                $scope.loginData = {};

                // reset main view state values
                $scope.viewState.isUserAuthenticated = false;
                $scope.viewState.selectedStudent = null;
                $scope.viewState.selectedClassroom = null;
                $scope.viewState.editingAttendance = false;
            }
        }, 0);
    }

    function initializeClassroomList() {
        // query the server for classrooms accessible by the current user and
        // handle async response with success/error callbacks
        classroomDataStore.getAll().then(
            function(classroomCollection) {
                if (classroomCollection.length === 0) {
                    // TODO
                    console.log('no classrooms found for user');
                }
                else if (classroomCollection.length === 1) {
                    // skip the classroom list setup and set the selected one immediately
                    var onlyClassroom = classroomCollection.models[0];
                    $scope.viewState.selectedClassroom = onlyClassroom;
                }
                else {
                    $scope.viewState.selectedClassroom = null;
                }

                $scope.viewState.classroomCollection = classroomCollection;
            },
            function(err) {
                // TODO: handle a problem getting the user's classroom list
                console.error('error fetching classroom list');
            }
        );
    }

});
