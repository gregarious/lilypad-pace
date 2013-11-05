angular.module('pace').service('apiConfig', function() {
	this.API_ROOT = '/api';
	this.toAPIUrl = function(relativePath) {
		return this.API_ROOT + '/' + relativePath;
	};
});
