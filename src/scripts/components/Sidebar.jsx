var React = require('react');

var {Pedigree, Schema, ObjectRef} = require('../common/Structures');
var FieldsSidebar = require('./sidebars/FieldsSidebar');


var Sidebar = React.createClass({
  propTypes: {
    pedigree: React.PropTypes.instanceOf(Pedigree).isRequired,
    documentSchema: React.PropTypes.instanceOf(Schema).isRequired,
    appSchema: React.PropTypes.instanceOf(Schema).isRequired,
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired
  },

  render: function() {
    return <FieldsSidebar {...this.props} />;
  }
});


module.exports = Sidebar;
