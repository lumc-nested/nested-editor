'use strict';


var webpack = require('webpack');


var NESTED_IFRAME = JSON.parse(process.env.NESTED_IFRAME || 'false');


module.exports = {
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      Nested: NESTED_IFRAME ? '../../src/scripts/components/FramedEditor' : '../../src/scripts/index'
    }),
    new webpack.DefinePlugin({
      __NESTED_IFRAME__: NESTED_IFRAME
    })
  ],

  entry: [
    'webpack/hot/only-dev-server',
    './example/scripts/app.jsx'
  ],

  output: {
    filename: 'main.js',
    publicPath: '/assets/'
  },

  devServer: {
    contentBase: './example',
    hot: true
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
      loader: 'react-hot!babel-loader?stage=1&optional=runtime'
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
  },

  cache: true,
  debug: true,
  devtool: 'eval'
};
