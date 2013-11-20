app.controller('LoginPromptCtrl', function ($scope, sessionManager, mainViewState, classroomDataStore, mixpanel) {
    /** $scope interface **/

    $scope.login = {};
    $scope.authenticated = false;

    $scope.logIn = logIn;
    $scope.logOut = logOut;

    var didResume = sessionManager.resumeSession();
    if (didResume) {
        startApp();
    }

    // uncomment to auto-login. 'feeny' has 3 classrooms in the dev fixture, 'turner' has only 1
    // $scope.login = {
    //     '$valid': true,
    //     'username': 'turner',
    //     'password': 'turner',
    // };
    // $scope.logIn();

    /** Implementation details **/

    function startApp() {
        mixpanel.identify(sessionManager.getValue('username'));
        $scope.authenticated = true;
        initializeClassroomList();
    }

    function logIn() {
        if ($scope.login.$valid) {
            var attemptingLogin = sessionManager.authenticateFromServer($scope.login.username, $scope.login.password);

            attemptingLogin.then(function() {
                sessionManager.setValue('username', $scope.login.username);
                startApp();
            }, function(errorInfo) {
                $scope.authenticated = false;
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
        var confirmLogout = confirm("Are you sure you want to logout?");
        if (confirmLogout === true) {
            sessionManager.clearSession();
            $scope.authenticated = false;
            $scope.login.username = null;
            $scope.login.password = null;
            mainViewState.selectedStudent = null;
            mainViewState.selectedClassroom = null;
            mainViewState.editingAttendance = false;
        }
    }

    $scope.$on('logOut', function() {
        logOut();
    });

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
                    mainViewState.selectedClassroom = onlyClassroom;
                }
                else {
                    mainViewState.selectedClassroom = null;
                }

                mainViewState.classroomCollection = classroomCollection;
            },
            function(err) {
                // TODO: handle a problem getting the user's classroom list
                console.error('error fetching classroom list');
            }
        );
    }

});
