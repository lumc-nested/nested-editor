var Immutable = require('immutable');
var React = require('react');

var AppConstants = require('../../constants/AppConstants');
var {Pedigree, Schema, ObjectRef} = require('../../common/Structures');

var Fields = require('./Fields');
var Schemas = require('./Schemas');


var VIEWS = {
  FIELDS: 0,
  SCHEMAS: 1
};


var FieldsSidebar = React.createClass({
  propTypes: {
    pedigree: React.PropTypes.instanceOf(Pedigree).isRequired,
    documentSchema: React.PropTypes.instanceOf(Schema).isRequired,
    appSchema: React.PropTypes.instanceOf(Schema).isRequired,
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired
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
    var focus = this.props.focus;
    var pedigree = this.props.pedigree;
    var appSchema = this.props.appSchema;
    var documentSchema = this.props.documentSchema;
    var fields;
    var appSchemas;
    var documentSchemas;

    switch (focus.type) {
      case AppConstants.ObjectType.Member:
        fields = pedigree.members.get(focus.key).fields;
        appSchemas = appSchema.member;
        documentSchemas = documentSchema.member;
        break;
      case AppConstants.ObjectType.Nest:
        fields = pedigree.nests.get(focus.key).fields;
        appSchemas = appSchema.nest;
        documentSchemas = documentSchema.nest;
        break;
      case AppConstants.ObjectType.Pedigree:
      default:
        fields = pedigree.fields;
        appSchemas = appSchema.pedigree;
        documentSchemas = documentSchema.pedigree;
    }

    if (this.state.view === VIEWS.SCHEMAS) {
      return <Schemas
        objectType={focus.type}
        appSchemas={appSchemas}
        documentSchemas={documentSchemas}
        showFields={() => this.changeView(VIEWS.FIELDS)}
      />;
    } else {
      return <Fields
        key={focus.toString()}
        objectRef={focus}
        fields={fields}
        schemas={documentSchemas.mergeDeep(appSchemas)}
        showSchemas={() => this.changeView(VIEWS.SCHEMAS)}
      />;
    }
  }
});


module.exports = FieldsSidebar;
