'use strict';


var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var ExcelReader = require('../readers/ExcelReader');
var JsonReader = require('../readers/JsonReader');
var PedReader = require('../readers/PedReader');

var AppStore = require('../stores/AppStore');
var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var DocumentStore = require('../stores/DocumentStore');

var DocumentControls = require('./DocumentControls');
var LayoutView = require('./LayoutView');
var MemberDetails = require('./MemberDetails');
var NestDetails = require('./NestDetails');
var PedigreeDetails = require('./PedigreeDetails');
var TableView = require('./TableView');


var Col = ReactBootstrap.Col;
var Grid = ReactBootstrap.Grid;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var Navbar = ReactBootstrap.Navbar;
var Row = ReactBootstrap.Row;
var TabbedArea = ReactBootstrap.TabbedArea;
var TabPane = ReactBootstrap.TabPane;


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


var readers = indexByArray([ExcelReader, JsonReader, PedReader], 'accept');


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


var PedigreeApp = React.createClass({
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

  openDocument: function(event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    var DocumentReader;

    // Clear input element so we are called again even when re-opening the
    // same file.
    event.target.value = null;

    DocumentReader = readers[file.name.split('.').pop()] || JsonReader;

    reader.onload = function(e) {
      var document = DocumentReader.readString(e.target.result);
      DocumentActions.openDocument(document);
    };

    if (file) {
      if (DocumentReader.binary) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    }
  },

  render: function() {
    var focus = this.state.document.focus;
    var redo = this.state.document.redo;
    var undo = this.state.document.undo;
    var pedigree = this.state.document.document.pedigree;
    var accept;
    var sidebar;

    switch (focus.level) {
      case AppConstants.FocusLevel.Member:
        sidebar = <MemberDetails
                    memberKey={focus.key}
                    fields={pedigree.members.get(focus.key)}
                    fieldDefinitions={this.state.schema.member}
                  />;
        break;
      case AppConstants.FocusLevel.Nest:
        sidebar = <NestDetails
                    nestKey={focus.key}
                    fields={pedigree.nests.get(focus.key).fields}
                    fieldDefinitions={this.state.schema.nest}
                  />;
        break;
      case AppConstants.FocusLevel.Pedigree:
      default:
        sidebar = <PedigreeDetails
                    fields={pedigree.fields}
                    fieldDefinitions={this.state.schema.pedigree}
                  />;
    }

    // Note: The `accept` attribute with file extensions only works in Google
    //   Chrome and Internet Explorer 10+.

    accept = Object.keys(readers).map(s => '.' + s).join(',');

    return (
      <div>
        <Navbar fluid inverse fixedTop brand="Pedigree Webapp">
          <Nav right>
            <NavItem>
              <span className="file-input">
                Open pedigree
                <input type="file" accept={accept} onChange={this.openDocument} />
              </span>
            </NavItem>
            <NavItem eventKey="sourceLink" href="https://git.lumc.nl/pedigree/webapp">
              Source code
            </NavItem>
          </Nav>
        </Navbar>
        <Grid fluid>
          <Row>
            <Col id="sidebar" sm={3} md={2}>
              {sidebar}
            </Col>
            <Col id="main" sm={9} smOffset={3} md={10} mdOffset={2}>
              <DocumentControls focus={focus} undo={undo} redo={redo} />
              <TabbedArea className="main-area" defaultActiveKey="layoutView" animation={false}>
                <TabPane eventKey="layoutView" tab="Layout">
                  <LayoutView pedigree={pedigree} focus={focus} />
                </TabPane>
                <TabPane eventKey="tableView" tab="Table">
                  <TableView pedigree={pedigree} focus={focus} />
                </TabPane>
              </TabbedArea>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
});


module.exports = PedigreeApp;
