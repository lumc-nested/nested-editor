'use strict';


// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var ExcelReader = require('../readers/ExcelReader');
var FamReader = require('../readers/FamReader');
var JsonReader = require('../readers/JsonReader');
var PedReader = require('../readers/PedReader');

var AppStore = require('../stores/AppStore');
var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var DocumentStore = require('../stores/DocumentStore');

var DocumentControls = require('./DocumentControls');
var FieldsView = require('./FieldsView');
var LayoutView = require('./LayoutView');
var RelationsView = require('./RelationsView');
var TableView = require('./TableView');


var Button = ReactBootstrap.Button;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Col = ReactBootstrap.Col;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;


var VIEWS = {
  LAYOUT: 0,
  TABLE: 1
};


// [{a: 1, b: [x, y]},
//  {a: 2, b: [z]}]
// =>
// {x: {a: 1, b: [x, y]},
//  y: {a: 1, b: [x, y]},
//  z: {a: 2, b: [z]}}
var indexByArray = function(objects, property) {
  var byArray = {};
  var i;
  var j;

  for (i = 0; i < objects.length; i++) {
    for (j = 0; j < objects[i][property].length; j++) {
      byArray[objects[i][property][j]] = objects[i];
    }
  }

  return byArray;
};


var readers = indexByArray([ExcelReader, FamReader, JsonReader, PedReader], 'accept');


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

  propTypes: {
    style: React.PropTypes.object
  },

  getInitialState: function() {
    var state = {
      view: VIEWS.LAYOUT,
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

  openDocument: function(document, filetype) {
    DocumentActions.openDocument(readers[filetype].readString(document));
  },

  changeView: function(view) {
    this.setState({view});
  },

  render: function() {
    var document = this.state.document.document;
    var focus = this.state.document.focus;
    var redo = this.state.document.redo;
    var undo = this.state.document.undo;
    var fieldsViewProps;
    var main;
    var sidebar;

    switch (this.state.view) {
      case VIEWS.TABLE:
        main = <TableView pedigree={document.pedigree} focus={focus} />;
        sidebar = <RelationsView pedigree={document.pedigree} focus={focus} />;
        break;

      case VIEWS.LAYOUT:
      default:
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

        main = <LayoutView pedigree={document.pedigree} focus={focus} symbol={document.symbol} />;
        sidebar = <FieldsView {...fieldsViewProps} />;
    }

    return (
      <div id="nested-editor">
        <ButtonToolbar id="toolbar" className="container-fluid">
          <div className="pull-left">
            <DocumentControls document={document} focus={focus} undo={undo} redo={redo} />
          </div>
          <div className="pull-right">
            <ButtonGroup>
              <Button
                  key="layout"
                  onClick={this.changeView.bind(this, VIEWS.LAYOUT)}
                  active={this.state.view === VIEWS.LAYOUT}>
                <Icon name="sitemap" />
              </Button>
              <Button
                  key="table"
                  onClick={this.changeView.bind(this, VIEWS.TABLE)}
                  active={this.state.view === VIEWS.TABLE}>
                <Icon name="table" />
              </Button>
            </ButtonGroup>
          </div>
        </ButtonToolbar>
        <Grid fluid>
          <Row>
            <Col id="main" style={this.props.style} sm={8} md={9} lg={10}>
              {main}
            </Col>
            <Col id="sidebar" style={this.props.style} sm={4} smOffset={8} md={3} mdOffset={9} lg={2} lgOffset={10}>
              {sidebar}
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
});


module.exports = Editor;
