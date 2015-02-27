'use strict';


var _ = require('lodash');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');
var PedParser = require('../parsers/PedParser');
var PedigreeConstants = require('../constants/PedigreeConstants');
var PedigreeParser = require('../parsers/PedigreeParser');

var LayoutView = require('./LayoutView');
var MemberDetails = require('./MemberDetails');
var NestDetails = require('./NestDetails');
var PedigreeDetails = require('./PedigreeDetails');
var PedigreeControls = require('./PedigreeControls');
var TableView = require('./TableView');


var Col = ReactBootstrap.Col;
var Grid = ReactBootstrap.Grid;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var Navbar = ReactBootstrap.Navbar;
var Row = ReactBootstrap.Row;
var TabbedArea = ReactBootstrap.TabbedArea;
var TabPane = ReactBootstrap.TabPane;


var schema = require('../../schema.json');


var getAppState = function() {
  var state = AppStore.getData();

  // TODO: This is a temporary solution to show predefined and custom columns.
  //   Merging with _.merge might not be the best solution and schema merging
  //   is done again on each app state change.
  state.schema = _.cloneDeep(schema);
  if (state.pedigree.props.has('schemaExtension')) {
    state.schema = _.merge(state.schema, state.pedigree.props.get('schemaExtension'));
  }

  return state;
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
    var pedigree = this.state.pedigree;
    var redoAction = this.state.redoAction;
    var undoAction = this.state.undoAction;
    var sidebar;

    switch (focus.level) {
      case PedigreeConstants.FocusLevel.Member:
        sidebar = <MemberDetails
                    memberProps={pedigree.members.get(focus.key)}
                    memberSchema={this.state.schema.definitions.member}
                  />;
        break;
      case PedigreeConstants.FocusLevel.Nest:
        sidebar = <NestDetails
                    nestProps={pedigree.nests.get(focus.key).props}
                    nestSchema={this.state.schema.definitions.nest}
                  />;
        break;
      case PedigreeConstants.FocusLevel.Pedigree:
      default:
        sidebar = <PedigreeDetails
                    pedigreeProps={pedigree.props}
                    pedigreeSchema={this.state.schema.definitions.pedigree}
                  />;
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
              {sidebar}
            </Col>
            <Col id="main" sm={9} smOffset={3} md={10} mdOffset={2}>
              <PedigreeControls focus={focus} undoAction={undoAction} redoAction={redoAction} />
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
