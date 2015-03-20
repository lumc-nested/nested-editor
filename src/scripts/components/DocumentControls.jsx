'use strict';


var FileSaver = require('FileSaver');
var Icon = require('react-fa');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var ExcelWriter = require('../writers/ExcelWriter');
var JsonWriter = require('../writers/JsonWriter');
var PedWriter = require('../writers/PedWriter');

var DocumentActions = require('../actions/DocumentActions');
var AppConstants = require('../constants/AppConstants');


var Button = ReactBootstrap.Button;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Tooltip = ReactBootstrap.Tooltip;


var stringToArrayBuffer = function(string) {
  var buffer = new ArrayBuffer(string.length);
  var view = new Uint8Array(buffer);
  var i;

  for (i = 0; i !== string.length; ++i) {
    view[i] = string.charCodeAt(i) & 0xFF;
  }
  return buffer;
};


var indexBy = function(objects, property) {
  var byProperty = {};
  objects.forEach(object => {
    byProperty[object[property]] = object;
  });
  return byProperty;
};


var writers = indexBy([ExcelWriter, JsonWriter, PedWriter], 'produce');


var DocumentControls = React.createClass({
  addSpouse: function() {
    DocumentActions.addSpouse(this.props.focus.get('key'));
  },

  addChild: function(gender) {
    DocumentActions.addChild(this.props.focus.get('key'), gender);
  },

  addTwin: function() {
    DocumentActions.addTwin(this.props.focus.get('key'));
  },

  undo: function() {
    DocumentActions.undo();
  },

  redo: function() {
    DocumentActions.redo();
  },

  download: function(eventKey) {
    var Writer = writers[eventKey];
    var blob;
    var result;

    result = Writer.writeString(this.props.document);

    if (Writer.binary) {
      blob = new Blob([stringToArrayBuffer(result)], {type: 'application/octet-stream'});
    } else {
      blob = new Blob([result], {type: 'text/plain;charset=utf-8'});
    }

    FileSaver.saveAs(blob, 'pedigree.' + eventKey);
  },

  render: function() {
    var documentButtons = {};
    var pedigreeButtons = {};
    var downloadItems;
    var tooltip;

    if (this.props.undo !== undefined) {
      tooltip = <Tooltip>Undo: <strong>{this.props.undo}</strong></Tooltip>;
      documentButtons.undo = <OverlayTrigger placement="bottom" overlay={tooltip}>
                               <Button key="undo" onClick={this.undo}><Icon name="undo" /></Button>
                             </OverlayTrigger>;
    } else {
      documentButtons.undo = <Button key="undo" disabled><Icon name="undo" /></Button>;
    }

    if (this.props.redo !== undefined) {
      tooltip = <Tooltip>Redo: <strong>{this.props.redo}</strong></Tooltip>;
      documentButtons.redo = <OverlayTrigger placement="bottom" overlay={tooltip}>
                               <Button key="redo" onClick={this.redo}><Icon name="repeat" /></Button>
                             </OverlayTrigger>;
    } else {
      documentButtons.redo = <Button key="redo" disabled><Icon name="repeat" /></Button>;
    }

    downloadItems = Object.keys(writers).map(
      produce => <MenuItem key={produce} eventKey={produce}>Save as .{produce}</MenuItem>
    );
    documentButtons.download = <DropdownButton key="download" onSelect={this.download} title={<Icon name="download" />}>
                                 {downloadItems}
                               </DropdownButton>;

    if (this.props.focus !== undefined) {
      switch (this.props.focus.get('level')) {
        case AppConstants.FocusLevel.Member:
          pedigreeButtons.addSpouse = <Button onClick={this.addSpouse}>Add spouse</Button>;
          if (this.props.pedigree.members.get(this.props.focus.key).parents.size) {
            // TODO: add twin with zygosity information.
            pedigreeButtons.addTwin = <Button onClick={this.addTwin}>Add twin</Button>;
          }
          break;

        case AppConstants.FocusLevel.Nest:
          pedigreeButtons.addChild = <DropdownButton onSelect={this.addChild} title="Add child">
                                       <MenuItem eventKey={AppConstants.Gender.Male}>Male</MenuItem>
                                       <MenuItem eventKey={AppConstants.Gender.Female}>Female</MenuItem>
                                       <MenuItem eventKey={AppConstants.Gender.Unknown}>Unknown</MenuItem>
                                     </DropdownButton>;
          break;
      }
    }

    return (
      <ButtonToolbar>
        <ButtonGroup>
          {documentButtons}
        </ButtonGroup>
        <ButtonGroup>
          {pedigreeButtons}
        </ButtonGroup>
      </ButtonToolbar>
    );
  }
});


module.exports = DocumentControls;
