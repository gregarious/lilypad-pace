angular.module('pace').service('authManager', function($http, $q, mixpanel, apiConfig) {
    var token = null;

    /**
     * If session is already authenticated, this will return the HTTP header
     * value to be used with all API requests. Will return '' if session
     * is not authenticated.
     *
     * @return {String}
     */
    this.getAuthToken = function() {
        if (token) {
            return 'Token ' + token;
        }
        else {
            return '';
        }
    };

    /**
     * Makes an asyncronous call to the server with the given to retrieve
     * the authentication token. Returns a promise that will be resolved
     * if authentication succeeds, and be rejected if it fails. After the
     * promise is resolved, future calls to `getAuthToken` will return the
     * HTTP header.
     *
     * @param  {String} username
     * @param  {String} password
     * @return {Promise}
     */
    this.authenticate = function(username, password) {
        var deferredLogin = $q.defer();

        // send the token request
        $http({
            method: 'POST',
            url: apiConfig.toAPIUrl('authtoken/'),
            data: {
                username: username,
                password: password
            }
        }).success(function(resp) {
            // save the session token
            token = resp.token;

            // mixpanel tracking
            mixpanel.track("Logged in");

            // no need to resolve with token. client can call `getAuthToken` for it
            deferredLogin.resolve();
        }).error(function(reason, statusCode) {
            // reject with an object descriping the error and the HTTP status code
            deferredLogin.reject([reason, statusCode]);
        });

        return deferredLogin.promise;
    };

    /**
     * Ends the current session by forgetting the user token. Important to call
     * this during log out.
     */
    this.reset = function() {
        token = null;
    };
});
