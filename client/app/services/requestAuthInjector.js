angular.module('pace').factory('requestAuthInjector', function(sessionManager) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = sessionManager.getAuthToken();
            return config;
        }
    };
});
