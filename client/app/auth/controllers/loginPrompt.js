app.controller('LoginPromptCtrl', function ($scope, $rootScope, sessionManager, classroomDataStore, mixpanel, $timeout) {
    /** $scope interface **/

    $scope.loginData = {};

    $scope.logIn = logIn;

    // hook to root scope's `logOut` broadcast
    $scope.$on('logOut', function() {
        logOut();
    });

    function logIn() {
        var data = $scope.loginData;
        if (data.username && data.password) {
            var attemptingLogin = sessionManager.authenticateFromServer(data.username, data.password);

            attemptingLogin.then(function() {
                sessionManager.setValue('username', data.username);
                $rootScope.grantAccess();
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
                $rootScope.revokeAccess();
                // reset login form
                $scope.loginData = {};
            }
        }, 0);
    }
});
