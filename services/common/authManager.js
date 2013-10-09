angular.module('pace').service('authManager', function() {
    var token = null;

    this.getAuthToken = function() {
        if (token) {
            return 'Token ' + token;
        }
        else {
            return '';
        }
    };

    this.authenticate = function(username, password) {
        if (username === 'feeny') {
            token = 'cce9b356c38ed8f3d0a59f2ca9d4cb108e92631f';
        }
        else if(username === 'turner') {
            token = 'f66dd627a2c9d22c540025cea178ab32e23045af';
        }
        else {
            return false;
        }

        return true;
    };
});
