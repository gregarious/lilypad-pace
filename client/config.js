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

// add http incerceptors
angular.module('pace').config(function($httpProvider) {
    // injects auth header into all requests
    $httpProvider.interceptors.push('requestAuthInjector');

    // transforms camel-to-snake case for request JSON
    // and vice-versa for response JSON
    $httpProvider.interceptors.push('jsonCaseTransformer');
});

