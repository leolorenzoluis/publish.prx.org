// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '..',
    frameworks: ['jasmine', 'angular-cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-phantomjs-launcher'),
      require('karma-spec-reporter'),
      require('karma-remap-istanbul'),
      require('angular-cli/plugins/karma')
    ],
    customLaunchers: {
      // chrome setup for travis CI using chromium
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    files: [
      { pattern: './src/test.ts', watched: false },
      { pattern: './public/**/*.*', watched: false, included: false }
    ],
    proxies: {
      '/assets/': '/base/public/assets/'
    },
    preprocessors: {
      './src/test.ts': ['angular-cli']
    },
    remapIstanbulReporter: {
      reports: {
        html: 'coverage'
      }
    },
    angularCliConfig: './angular-cli.json',
    reporters: ['spec', 'karma-remap-istanbul'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    // browsers: ['Chrome'],
    singleRun: false
  });
};
