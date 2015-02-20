'use strict';

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var AppActions = require('../actions/AppActions');
var PC = require('../constants/PedigreeConstants');

var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;
var Button = ReactBootstrap.Button;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Tooltip = ReactBootstrap.Tooltip;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Icon = require('react-fa');


var Controls = React.createClass({
  addSpouse: function() {
    AppActions.addSpouse();
  },

  addChild: function() {
    AppActions.addChild(PC.Gender.Unknown);
  },

  addSon: function() {
    AppActions.addChild(PC.Gender.Male);
  },

  addDaughter: function() {
    AppActions.addChild(PC.Gender.Female);
  },

  undo: function() {
    AppActions.undo();
  },

  redo: function() {
    AppActions.redo();
  },

  render: function() {
    // Note: The `accept` attribute with file extensions only works in
    //   Google Chrome and Internet Explorer 10+.
    var tooltip;
    var buttons = {};

    if (this.props.undoAction !== undefined) {
      tooltip = <Tooltip>Undo <strong>{this.props.undoAction}</strong></Tooltip>;
      buttons.undo = <OverlayTrigger placement="bottom" overlay={tooltip}>
                       <Button key="undo" onClick={this.undo}><Icon name="undo" /></Button>
                     </OverlayTrigger>;
    } else {
      buttons.undo = <Button key="undo" disabled><Icon name="undo" /></Button>;
    }

    if (this.props.redoAction !== undefined) {
      tooltip = <Tooltip>Redo <strong>{this.props.redoAction}</strong></Tooltip>;
      buttons.redo = <OverlayTrigger placement="bottom" overlay={tooltip}>
                       <Button key="redo" onClick={this.redo}><Icon name="repeat" /></Button>
                     </OverlayTrigger>;
    } else {
      buttons.redo = <Button key="redo" disabled><Icon name="repeat" /></Button>;
    }

    if (this.props.focus !== undefined) {
      switch (this.props.focus.get('level')) {
        case PC.FocusLevel.Member:
          buttons.addSpouse = <Button onClick={this.addSpouse}>Add spouse</Button>;
          break;

        case PC.FocusLevel.Nest:
          buttons.addChild = <DropdownButton title="Add child">
                              <MenuItem eventKey="1" onClick={this.addSon}>Male</MenuItem>
                              <MenuItem eventKey="2" onClick={this.addDaughter}>Female</MenuItem>
                              <MenuItem eventKey="3" onClick={this.addChild}>Unknown</MenuItem>
                            </DropdownButton>;
          break;
      }
    }

    return (
      <div id="svg-controls">
        <ButtonToolbar>
          <ButtonGroup>
            {buttons.undo}
            {buttons.redo}
          </ButtonGroup>
          <ButtonGroup>
            {buttons.addSpouse}
            {buttons.addChild}
          </ButtonGroup>
        </ButtonToolbar>
      </div>
    );
  }
});


// CSS
require('../../styles/svgControls.less');


module.exports = Controls;
