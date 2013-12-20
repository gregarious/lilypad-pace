angular.module('pace').factory('authRequestInterceptor', function(sessionManager) {
    return {
        request: function(config) {
            config.headers = {'Authorization': sessionManager.getAuthToken()};
            return config;
        }
    };
});
