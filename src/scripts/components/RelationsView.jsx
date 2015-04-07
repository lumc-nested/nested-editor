'use strict';


var React = require('react');


var RelationsView = React.createClass({
  render: function() {
    console.log(this.props);
    return <p>{this.props.title}</p>;
  }
});


module.exports = RelationsView;
