var app = angular.module('pace');

app.config(function(timeTrackerProvider) {
    // override timeTracker for development by setting app time to set app
    // time to 8/20/2013 at 10am
    timeTrackerProvider.setAnchorTime(new Date(2013, 8, 5, 10, 10));
});

