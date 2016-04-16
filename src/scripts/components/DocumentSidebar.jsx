var Immutable = require('immutable');
var React = require('react');


var DocumentSidebar = React.createClass({
  propTypes: {
    fields: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    schemas: React.PropTypes.instanceOf(Immutable.Map).isRequired
  },

  render: function() {
    return (
      <div>
        <h1>Document</h1>
        <p>{this.props.fields.get('title')}</p>
      </div>
    );
  }
});


module.exports = DocumentSidebar;
