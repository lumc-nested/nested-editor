var Immutable = require('immutable');
var React = require('react');

var {Document, ObjectRef} = require('../common/Structures');

var IndividualSidebar = require('./IndividualSidebar');
var MatingSidebar = require('./MatingSidebar');
var DocumentSidebar = require('./DocumentSidebar');


var VIEWS = {
  FIELDS: 0,
  SCHEMAS: 1
};


var LayoutSidebar = React.createClass({
  propTypes: {
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired,
    document: React.PropTypes.instanceOf(Document).isRequired,
    documentFieldSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    individualFieldSchemas: React.PropTypes.instanceOf(Immutable.Map).isRequired
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
      case 'individual':
        return <IndividualSidebar
                 individual={document.individuals.get(focus.key)}
                 individualKey={focus.key}
                 schemas={this.props.individualFieldSchemas}
                 customSchemas={document.customIndividualFieldSchemas} />;
      case 'mating':
        return <MatingSidebar
                 father={document.individuals.get(focus.key.father)}
                 mother={document.individuals.get(focus.key.mother)}
                 fatherKey={focus.key.father}
                 motherKey={focus.key.mother} />;
      case 'document':
      default:
        return <DocumentSidebar
                 fields={document.fields}
                 schemas={this.props.documentFieldSchemas} />;
    }
  }
});


module.exports = LayoutSidebar;
