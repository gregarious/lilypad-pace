angular.module('pace').config(function(timeTrackerProvider) {
    timeTrackerProvider.setAnchorTime(new Date(2013, 8, 5));
});

angular.module('mixpanel').config(function(mixpanelProvider) {
    // uncomment this to track with real Mixpanel
    // mixpanelProvider.activate();

    // this logs all mock Mixpanel calls to the console
    // (only works if not real Mixpanel is not activated)
    mixpanelProvider.logStubCalls();
});

// add authorization header to all requests
angular.module('pace').config(function($httpProvider) {
    $httpProvider.interceptors.push('requestAuthInjector');
    $httpProvider.interceptors.push('jsonCaseTransformer');
});

