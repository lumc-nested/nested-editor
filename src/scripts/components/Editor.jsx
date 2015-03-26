'use strict';


var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var AppStore = require('../stores/AppStore');
var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var DocumentStore = require('../stores/DocumentStore');

var DocumentControls = require('./DocumentControls');
var FieldsView = require('./FieldsView');
var LayoutView = require('./LayoutView');
var TableView = require('./TableView');


var Col = ReactBootstrap.Col;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var TabbedArea = ReactBootstrap.TabbedArea;
var TabPane = ReactBootstrap.TabPane;


var getAppState = function() {
  return {
    schema: AppStore.getSchema()
  };
};


var getDocumentState = function() {
  return {
    focus: DocumentStore.getFocus(),
    undo: DocumentStore.getUndo(),
    redo: DocumentStore.getRedo(),
    document: DocumentStore.getDocument()
  };
};


var Editor = React.createClass({
  getInitialState: function() {
    var state = {
      app: getAppState(),
      document: getDocumentState()
    };
    state.schema = state.document.document.schema.mergeDeep(state.app.schema);
    return state;
  },

  _onChange: function() {
    var state = {
      app: getAppState(),
      document: getDocumentState()
    };
    if (!state.document.document.schema.equals(this.state.document.document.schema)) {
      console.log('********** merging schema');
      state.schema = state.document.document.schema.mergeDeep(state.app.schema);
    }
    this.setState(state);
  },

  componentDidMount: function() {
    DocumentStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    DocumentStore.removeChangeListener(this._onChange);
  },

  render: function() {
    var document = this.state.document.document;
    var focus = this.state.document.focus;
    var redo = this.state.document.redo;
    var undo = this.state.document.undo;
    var fieldsView;
    var fieldsViewProps;

    switch (focus.level) {
      case AppConstants.FocusLevel.Member:
        fieldsViewProps = {
          title: 'Member (' + focus.key + ')',
          fields: document.pedigree.members.get(focus.key).fields,
          fieldDefinitions: this.state.schema.member,
          onSubmit: fields => DocumentActions.updateMember(focus.key, fields)
        };
        break;
      case AppConstants.FocusLevel.Nest:
        fieldsViewProps = {
          title: 'Nest',
          fields: document.pedigree.nests.get(focus.key).fields,
          fieldDefinitions: this.state.schema.nest,
          onSubmit: fields => DocumentActions.updateNest(focus.key, fields)
        };
        break;
      case AppConstants.FocusLevel.Pedigree:
      default:
        fieldsViewProps = {
          title: 'Pedigree',
          fields: document.pedigree.fields,
          fieldDefinitions: this.state.schema.pedigree,
          onSubmit: fields => DocumentActions.updatePedigree(fields)
        };
    }

    fieldsView = <FieldsView {...fieldsViewProps} />;

    return (
      <Grid id="editor" fluid>
        <Row>
          <Col id="sidebar" sm={3} md={2}>
            {fieldsView}
          </Col>
          <Col id="main" sm={9} md={10}>
            <DocumentControls document={document} focus={focus} undo={undo} redo={redo} pedigree={document.pedigree}/>
            <TabbedArea className="main-area" defaultActiveKey="layoutView" animation={false}>
              <TabPane eventKey="layoutView" tab="Layout">
                <LayoutView pedigree={document.pedigree} focus={focus} />
              </TabPane>
              <TabPane eventKey="tableView" tab="Table">
                <TableView pedigree={document.pedigree} focus={focus} />
              </TabPane>
            </TabbedArea>
          </Col>
        </Row>
      </Grid>
    );
  }
});


module.exports = Editor;
