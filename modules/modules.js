/* Turn third-party packages into modules */

angular.module('underscore', []).
	constant('_', window._);

angular.module('backbone', ['underscore']).
	factory('Backbone', function($http) {
		window.Backbone._patchAjax($http);
		return window.Backbone;
	});

angular.module('moment', []).
	constant('moment', window.moment);
