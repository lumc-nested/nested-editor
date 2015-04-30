'use strict';


var React = require('react');

var AppConstants = require('../constants/AppConstants');
var {Pedigree, Schema, ObjectRef} = require('../common/Structures');

var Fields = require('./fields/Fields');


var LayoutSidebar = React.createClass({
  propTypes: {
    pedigree: React.PropTypes.instanceOf(Pedigree).isRequired,
    documentSchema: React.PropTypes.instanceOf(Schema).isRequired,
    appSchema: React.PropTypes.instanceOf(Schema).isRequired,
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired
  },

  render: function() {
    var focus = this.props.focus;
    var pedigree = this.props.pedigree;
    var appSchema = this.props.appSchema;
    var documentSchema = this.props.documentSchema;

    switch (focus.type) {
      case AppConstants.ObjectType.Member:
        return <Fields objectRef={focus}
                       fields={pedigree.members.get(focus.key).fields}
                       appSchemas={appSchema.member}
                       documentSchemas={documentSchema.member} />;
      case AppConstants.ObjectType.Nest:
        return <Fields objectRef={focus}
                       fields={pedigree.nests.get(focus.key).fields}
                       appSchemas={appSchema.nest}
                       documentSchemas={documentSchema.nest} />;
      case AppConstants.ObjectType.Pedigree:
      default:
        return <Fields objectRef={focus}
                       fields={pedigree.fields}
                       appSchemas={appSchema.pedigree}
                       documentSchemas={documentSchema.pedigree} />;
    }
  }
});


module.exports = LayoutSidebar;
