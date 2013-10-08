angular.module('pace').provider('authManager', function() {
    var token = null;

    this.$get = function() {
        return {
            getAuthToken: function() {
                if (token) {
                    return 'Token ' + token;
                }
                else {
                    return '';
                }
            }
        };
    };

    this.setToken = function(newToken) {
        token = newToken;
    };
});
