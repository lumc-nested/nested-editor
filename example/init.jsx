var React = require('react');
var ReactDOM = require('react-dom');
var Example = require('./Example');


require('babel-polyfill');


require('./styles.less');


// Export React so the devtools can find it
(window !== window.top ? window.top : window).React = React;


ReactDOM.render(<Example />, document.getElementById('content'));


module.exports = {};
