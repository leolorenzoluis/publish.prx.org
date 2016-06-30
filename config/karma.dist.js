// Karma configuration
// Generated on Thu Apr 14 2016 16:01:05 GMT-0600 (MDT)

module.exports = function(config) {
  'use strict';
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jspm', 'jasmine'],


    jspm: {
      useBundles: true,
      loadFiles: [
        'app/**/*.spec.ts',
        'util/**/*.spec.ts'
      ],
      serveFiles: [
        '.dev/main.js',
        '.dev/main.js.map',
        'tsconfig.json',
        'app/**/*.css',
        'util/test-helper.ts',
        // TODO: move this elsewhere
        'app/shared/cms/cms.mocks.ts'
      ]
    },


    proxies: {
      '/.dev/': '/base/.dev/',
      '/app/': '/base/app/',
      '/assets/': '/base/assets/',
      '/config/': '/base/config/',
      '/util/': '/base/util/',
      '/jspm_packages/': '/base/jspm_packages/',
      '/tsconfig.json': '/base/tsconfig.json'
    },


    // list of files / patterns to load in the browser
    files: [
      {pattern: 'assets/**/*.*', watched: false, included: false, served: true}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    // singleRun: true,


    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
