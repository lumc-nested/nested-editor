'use strict';


var React = require('react');


var RelationsView = React.createClass({

  propTypes: {
    title: React.PropTypes.string
  },

  render: function() {
    console.log(this.props);
    return <p>{this.props.title}</p>;
  }
});


module.exports = RelationsView;
