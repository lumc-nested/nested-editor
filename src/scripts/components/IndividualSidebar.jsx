var Immutable = require('immutable');
var React = require('react');

var IndividualFields = require('./IndividualFields');
var IndividualSchemas = require('./IndividualSchemas');


var VIEWS = {
  FIELDS: 0,
  SCHEMAS: 1
};


var IndividualSidebar = React.createClass({
  propTypes: {
    individual: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    individualKey: React.PropTypes.string.isRequired,
    schemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    customSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired
  },

  getInitialState: function() {
    return {view: VIEWS.FIELDS};
  },

  componentWillReceiveProps: function(nextProps) {
    if (!Immutable.is(this.props.individual, nextProps.individual)) {
      this.changeView(VIEWS.FIELDS);
    }
  },

  changeView: function(view) {
    this.setState({view});
  },

  render: function() {
    if (this.state.view === VIEWS.SCHEMAS) {
      return <IndividualSchemas
               schemas={this.props.schemas}
               customSchemas={this.props.customSchemas}
               showFields={() => this.changeView(VIEWS.FIELDS)} />;
    } else {
      return <IndividualFields
               individual={this.props.individual}
               individualKey={this.props.individualKey}
               schemas={this.props.customSchemas.merge(this.props.schemas)}
               showSchemas={() => this.changeView(VIEWS.SCHEMAS)} />;
    }
  }
});


module.exports = IndividualSidebar;
