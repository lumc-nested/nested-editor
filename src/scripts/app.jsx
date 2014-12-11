'use strict';

var React = require('react');


// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;

// CSS
require('../styles/normalize.css');
require('../styles/main.less');



var PedigreeApp = require('./components/PedigreeApp.jsx');

React.render(<PedigreeApp />, document.getElementById('content')); // jshint ignore:line

module.exports = {};