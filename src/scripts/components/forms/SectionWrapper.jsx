var React = require('react');


var SectionWrapper = React.createClass({
  // We don't implement sections for now.
  render: function() {
    return <div key={this.props.label}>{this.props.children}</div>;
  }
});


module.exports = SectionWrapper;
