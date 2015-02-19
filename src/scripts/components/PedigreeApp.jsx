/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var AppStore = require('../stores/AppStore');
var PC = require('../constants/PedigreeConstants');

var MemberDetails = require('./MemberDetails.jsx');
var Pedigree = require('./PedigreeSVG.jsx');
var Controls = require('./SVGControls.jsx');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;

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

  render: function() {
    var focus = this.state.focus;
    var selectedMember;
    console.log(this.state);

    if (focus !== undefined &&
        focus.get('level') === PC.FocusLevel.Member &&
        this.state.pedigree) {
      selectedMember = this.state.pedigree.get('members').find(m => m.get('_id') === focus.get('key'));
    }

    return (
      <Grid>
        <Row>
          <Col md="12">
            <Controls focus={focus} />
          </Col>
        </Row>
        <Row>
          <Col md="8">
            <Pedigree pedigree={this.state.pedigree} focus={focus} />
          </Col>
          <Col md="4">
            <MemberDetails selected={selectedMember} />
          </Col>
        </Row>
      </Grid>
    );
  }
});


module.exports = PedigreeApp;
