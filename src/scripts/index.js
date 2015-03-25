'use strict';


// TODO: I hope this is a temporary workaround for an ESLint bug?
/*eslint-disable no-unused-vars, no-undef */
var React = require('react');
var PedigreeApp = require('./components/PedigreeApp');


// CSS
require('../styles/normalize.css');
require('../styles/main.less');


// ES6 polyfills
require('babel-core/polyfill');


module.exports = PedigreeApp;
