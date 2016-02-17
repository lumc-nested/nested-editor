'use strict';


var path = require('path');
var webpack = require('webpack');


// Detect if we're running webpack dev server or building a distribution.
var devServer = path.basename(require.main.filename) === 'webpack-dev-server.js';


// Detect if the webpack dev server should run the IFrame version.
var nestedIFrame = JSON.parse(process.env.NESTED_IFRAME || 'false');


var config = {
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],

  entry: './src/scripts/index.js',

  output: {
    filename: 'main.js',
    path: 'dist/'
  },

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  module: {
    // JSZip is bundled with xlsx as a pre-built javascript file.
    noParse: [/\/jszip\.js$/],

    preLoaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }],

    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader?stage=1&optional=runtime'
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
      loader: 'url-loader?limit=10000&mimetype=application/font-woff'
    }, {
      test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?limit=10000&mimetype=application/font-woff2'
    }, {
      test: /\.(otf|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader'
    }]
  },

  cache: false,
  debug: false,
  devtool: false
};


if (devServer) {
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      Nested: nestedIFrame ? '../src/scripts/components/FramedEditor' : '../src/scripts/index'
    }),
    new webpack.DefinePlugin({
      __NESTED_IFRAME__: nestedIFrame,
      'process.env.NODE_ENV': '"development"'
    })
  );
  config.entry = [
    'webpack/hot/only-dev-server',
    './example/init.jsx'
  ];
  config.devServer = {
    contentBase: './example',
    hot: true
  };
  config.output.publicPath = '/dist/';
  config.module.loaders[0].loader = 'react-hot!babel-loader?stage=1&optional=runtime';
  config.cache = true;
  config.debug = true;
  config.devtool = 'eval';
} else {
  config.plugins.push(
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({compress: {drop_console: false}}),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'})
  );
}


module.exports = config;
