var React = require('react');
var Example = require('./Example');


require('babel-core/polyfill');


require('../styles/main.less');


// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;


React.render(<Example />, document.getElementById('content'));


module.exports = {};
