'use strict';

module.exports = function (config) {
  config.set({
    basePath: 'test',
    frameworks: ['jasmine'],
    files: [
      'helpers/**/*.js',
      'spec/components/**/*.js',
      'spec/core/**/*.js'
    ],
    preprocessors: {
      'spec/components/**/*.js': ['webpack'],
      'spec/core/**/*.js': ['webpack']
    },
    webpack: {
      cache: true,
      resolve: {
        extensions: ['', '.js', '.jsx']
      },
      module: {
        noParse: [/\/jszip\.js$/],
        loaders: [{
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader?optional=runtime'
        }, {
          test: /\.css$/,
          loader: 'style-loader!css-loader'
        }, {
          test: /\.less$/,
          loader: 'style-loader!css-loader!less-loader'
        }, {
          test: /\.(png|jpg)$/,
          loader: 'url-loader?limit=8192'
        }, {
          test: /\.json$/,
          loader: 'json'
        }, {
          test: /\.pegjs$/,
          loader: 'pegjs-loader'
        }, {
          test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader?limit=10000&minetype=application/font-woff'
        }, {
          test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader?limit=10000&minetype=application/font-woff2'
        }, {
          test: /\.(otf|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader'
        }]
      }
    },
    webpackServer: {
      stats: {
        colors: true
      }
    },
    exclude: [],
    port: 8080,
    logLevel: config.LOG_INFO,
    colors: true,
    autoWatch: false,
    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],
    reporters: ['progress'],
    captureTimeout: 60000,
    singleRun: true
  });
};
