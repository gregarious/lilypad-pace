var app = angular.module('pace');

app.config(function(timeTrackerProvider) {
    // override timeTracker for development by setting app time to set app
    // time to 8/20/2013 at 10am
    timeTrackerProvider.setAnchorTime(new Date(2013, 8, 5, 10, 10));
});

app.config(function(authManagerProvider) {
    // directly set auth token for development
    authManagerProvider.setToken('f66dd627a2c9d22c540025cea178ab32e23045af')

    // Development DB tokens:
    // feeny (all classrooms): cce9b356c38ed8f3d0a59f2ca9d4cb108e92631f
    // turner (one classroom): f66dd627a2c9d22c540025cea178ab32e23045af
});
