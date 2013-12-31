angular.module('pace').service('sessionManager', function($q, $injector, mixpanel, apiConfig) {
    /** interface **/
    this.getAuthToken = getAuthToken;
    this.getValue = getValue;
    this.setValue = setValue;

    // session management
    this.authenticateFromServer = authenticateFromServer;
    this.clearSession = clearSession;
    this.resumeSession = resumeSession;

    var session = {};

    /**
     * If session is already authenticated, this will return the HTTP header
     * value to be used with all API requests. Will return '' if session
     * is not authenticated.
     *
     * @return {String}
     */
    function getAuthToken() {
        // DEV: turner's token
        return 'Token f66dd627a2c9d22c540025cea178ab32e23045af';
        // DEV: feeny's token
        // return 'Token cce9b356c38ed8f3d0a59f2ca9d4cb108e92631f';

        if (session.token) {
            return 'Token ' + session.token;
        }
        else {
            return '';
        }
    }

    function setValue(key, value) {
        session.userData = session.userData || {};
        session.userData[key] = value;
        // update local storage
        localStorage.setItem('sessionUserData', JSON.stringify(session.userData));
    }

    function getValue(key) {
        session.userData = session.userData || {};
        return session.userData[key];
    }

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
    function authenticateFromServer(username, password) {
        var deferredLogin = $q.defer();

        // need to manually get this ref: circular dependency otherwise
        var $http = $injector.get('$http');

        // send the token request
        $http({
            method: 'POST',
            url: apiConfig.toAPIUrl('authtoken/'),
            data: {
                username: username,
                password: password
            }
        }).success(function(resp) {
            // start a new session
            session.token = resp.token;
            session.expires = moment().add(12, 'hours').toDate();

            localStorage.setItem('sessionToken', session.token);
            localStorage.setItem('sessionExpires', JSON.stringify(session.expires));
            localStorage.setItem('sessionUserData', JSON.stringify({}));

            // mixpanel tracking
            mixpanel.track("Logged in");

            // no need to resolve with token. client can call `getAuthToken` for it
            deferredLogin.resolve();
        }).error(function(reason, statusCode) {
            // reject with an object descriping the error and the HTTP status code
            deferredLogin.reject([reason, statusCode]);
        });

        return deferredLogin.promise;
    }

    /**
     * Ends the current session by forgetting the session info. Important to call
     * this during log out.
     */
    function clearSession() {
        session.token = null;
        localStorage.removeItem('sessionToken');

        session.expires = null;
        localStorage.removeItem('sessionExpires');

        session.userData = {};
        localStorage.removeItem('sessionUserData');
    }

    /**
     * Resumes the session saved to disk, if found. Also will invalidate a
     * session that has expired.
     *
     * Returns true if session was found and valid, false otherwise.
     */
    function resumeSession() {
        // try to restore session from local storage
        session.token = localStorage.getItem('sessionToken');
        if (!session.token) {
            clearSession();
            return false;
        }

        var storedExpiresString = localStorage.getItem('sessionExpires');
        session.expires = new Date(JSON.parse(storedExpiresString));
        if (!session.expires || session.expires < new Date()) {
            clearSession();
            return false;
        }

        // finally, load the user data and return
        session.userData = JSON.parse(localStorage.getItem('sessionUserData'));
        return true;
    }
});
