var Immutable = require('immutable');
var React = require('react');

var {Document, ObjectRef} = require('../common/Structures');

var MemberSidebar = require('./MemberSidebar');
var NestSidebar = require('./NestSidebar');
var PedigreeSidebar = require('./PedigreeSidebar');


var VIEWS = {
  FIELDS: 0,
  SCHEMAS: 1
};


var LayoutSidebar = React.createClass({
  propTypes: {
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired,
    document: React.PropTypes.instanceOf(Document).isRequired,
    documentFieldSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    memberFieldSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired
  },

  getInitialState: function() {
    return {view: VIEWS.FIELDS};
  },

  componentWillReceiveProps: function(nextProps) {
    if (!Immutable.is(this.props.focus, nextProps.focus)) {
      this.changeView(VIEWS.FIELDS);
    }
  },

  changeView: function(view) {
    this.setState({view});
  },

  render: function() {
    var document = this.props.document;
    var focus = this.props.focus;

    switch (focus.type) {
      case 'member':
        return <MemberSidebar
                 member={document.members.get(focus.key)}
                 memberKey={focus.key}
                 schemas={this.props.memberFieldSchemas}
                 customSchemas={document.customMemberFieldSchemas} />;
      case 'nest':
        return <NestSidebar
                 father={document.members.get(focus.key.father)}
                 mother={document.members.get(focus.key.mother)}
                 fatherKey={focus.key.father}
                 motherKey={focus.key.mother} />;
      case 'pedigree':
      default:
        return <PedigreeSidebar
                 fields={document.fields}
                 schemas={this.props.documentFieldSchemas} />;
    }
  }
});


module.exports = LayoutSidebar;
