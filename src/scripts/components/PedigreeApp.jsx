/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var AppStore = require('../stores/AppStore');
var AppActions = require('../actions/AppActions');
var PedigreeParser = require('../parsers/PedigreeParser.js');
var PedParser = require('../parsers/PedParser.js');
var PC = require('../constants/PedigreeConstants');

var MemberDetails = require('./MemberDetails.jsx');
var PedigreeControls = require('./PedigreeControls.jsx');
var LayoutView = require('./LayoutView.jsx');
var TableView = require('./TableView.jsx');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Navbar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var TabbedArea = ReactBootstrap.TabbedArea;
var TabPane = ReactBootstrap.TabPane;

var getAppState = function() {
  return AppStore.getData();
};


var PedigreeApp = React.createClass({
  getInitialState: function() {
    return getAppState();
  },

  _onChange: function() {
    this.setState(getAppState());
  },

  componentDidMount: function() {
    AppStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },

  loadPedigree: function(event) {
    var reader = new FileReader();
    var file = event.target.files[0];

    // Clear input element so we are called again even when re-opening the
    // same file.
    event.target.value = null;

    reader.onload = function(e) {
      var parser, pedigree;
      if (file.name.split('.').pop() === 'ped') {
        parser = PedParser;
      } else {
        parser = PedigreeParser;
      }
      pedigree = parser.parse(e.target.result);
      AppActions.loadPedigree(pedigree);
    };

    if (file) {
      reader.readAsText(file);
    }
  },

  render: function() {
    var focus = this.state.focus;
    var undoAction = this.state.undoAction;
    var redoAction = this.state.redoAction;
    var selectedMember;
    console.log(this.state);

    if (focus !== undefined &&
        focus.get('level') === PC.FocusLevel.Member &&
        this.state.pedigree) {
      selectedMember = this.state.pedigree.get('members').find(m => m.get('_id') === focus.get('key'));
    }

    return (
      <div>
        <Navbar fluid inverse fixedTop brand="Pedigree Webapp">
          <Nav right>
            <NavItem>
              <span className="file-input">
                Load pedigree
                <input type="file" accept=".json,.ped" onChange={this.loadPedigree} />
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
              <MemberDetails selected={selectedMember} />
            </Col>
            <Col id="main" sm={9} smOffset={3} md={10} mdOffset={2}>
              <PedigreeControls focus={focus} undoAction={undoAction} redoAction={redoAction} />
              <TabbedArea className="main-area" defaultActiveKey="layoutView" animation={false}>
                <TabPane eventKey="layoutView" tab="Layout">
                  <LayoutView pedigree={this.state.pedigree} focus={focus} />
                </TabPane>
                <TabPane eventKey="tableView" tab="Table">
                  <TableView pedigree={this.state.pedigree} focus={focus} />
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
