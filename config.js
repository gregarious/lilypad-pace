angular.module('mixpanel').config(function(mixpanelProvider) {
    // uncomment this to track with real Mixpanel
    // mixpanelProvider.activate();

    // this logs all mock Mixpanel calls to the console
    // (only works if not real Mixpanel is not activated)
    mixpanelProvider.logStubCalls();
});

angular.module('pace').config(function(timeTrackerProvider) {
    // override timeTracker for development by setting app time to set app
    // time to 8/20/2013 at 10am
    timeTrackerProvider.setAnchorTime(new Date(2013, 8, 5, 10, 10));
});

