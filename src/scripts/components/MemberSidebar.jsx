var Immutable = require('immutable');
var React = require('react');

var MemberFields = require('./MemberFields');
var MemberSchemas = require('./MemberSchemas');


var VIEWS = {
  FIELDS: 0,
  SCHEMAS: 1
};


var MemberSidebar = React.createClass({
  propTypes: {
    member: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    memberKey: React.PropTypes.string.isRequired,
    schemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    customSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired
  },

  getInitialState: function() {
    return {view: VIEWS.FIELDS};
  },

  componentWillReceiveProps: function(nextProps) {
    if (!Immutable.is(this.props.member, nextProps.member)) {
      this.changeView(VIEWS.FIELDS);
    }
  },

  changeView: function(view) {
    this.setState({view});
  },

  render: function() {
    if (this.state.view === VIEWS.SCHEMAS) {
      return <MemberSchemas
               schemas={this.props.schemas}
               customSchemas={this.props.customSchemas}
               showFields={() => this.changeView(VIEWS.FIELDS)} />;
    } else {
      return <MemberFields
               member={this.props.member}
               memberKey={this.props.memberKey}
               schemas={this.props.customSchemas.merge(this.props.schemas)}
               showSchemas={() => this.changeView(VIEWS.SCHEMAS)} />;
    }
  }
});


module.exports = MemberSidebar;
