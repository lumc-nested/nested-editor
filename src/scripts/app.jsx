'use strict';


var React = require('react');
var PedigreeApp = require('./components/PedigreeApp');


// ES6 polyfills
require('babel-core/polyfill');


// CSS
require('../styles/normalize.css');
require('../styles/main.less');


// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;


React.render(<PedigreeApp />, document.getElementById('content'));


module.exports = {};
