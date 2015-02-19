'use strict';

var React = require('react');
var PedigreeApp = require('./components/PedigreeApp.jsx');

// CSS
require('../styles/normalize.css');
require('../styles/main.less');

// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;

React.render(<PedigreeApp />, document.getElementById('content')); // jshint ignore:line

module.exports = {};
