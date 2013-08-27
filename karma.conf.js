// Karma configuration
// Generated on Wed Aug 07 2013 14:43:44 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        // dependencies
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular-mobile.js',
        'lib/underscore.js',
        'lib/backbone.js',
        'lib/moment.js',

        // our code
        'modules/underscore.js',
        'modules/backbone.js',
        'modules/moment.js',
        'modules/widgets.js',
        'app.js',
        'services/**/*.js',

        // angular mock library for Jasmine
        'tests/angular-mocks.js',

        // tests
        'tests/init.js',
        'tests/**/*.js'
    ],


    // list of files to exclude
    exclude: [

    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'osx'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Safari'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
