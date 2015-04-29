'use strict';


var FileSaver = require('FileSaver');
// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var React = require('react');
var {Button, ButtonGroup, DropdownButton, MenuItem, OverlayTrigger, Tooltip} = require('react-bootstrap');

var ExcelWriter = require('../writers/ExcelWriter');
var JsonWriter = require('../writers/JsonWriter');
var PedWriter = require('../writers/PedWriter');

var DocumentActions = require('../actions/DocumentActions');
var AppConstants = require('../constants/AppConstants');
var {Document, ObjectRef} = require('../common/Structures');


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

  propTyps: {
    document: React.PropTypes.instanceOf(Document).isRequired,
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired,
    redo: React.PropTypes.string.isRequired,
    undo: React.PropTypes.string.isRequired
  },

  addSpouse: function() {
    DocumentActions.addSpouse(this.props.focus.get('key'));
  },

  addChild: function(gender) {
    DocumentActions.addChild(this.props.focus.get('key'), gender);
  },

  addParents: function() {
    DocumentActions.addParents(this.props.focus.get('key'));
  },

  addTwin: function() {
    DocumentActions.addTwin(this.props.focus.get('key'));
  },

  deleteMember: function() {
    DocumentActions.deleteMember(this.props.focus.get('key'));
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
    var focus = this.props.focus;
    var pedigree = this.props.document.pedigree;
    var downloadItems;
    var tooltip;
    var canDelete;

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

    // todo loose the this.props prefix
    if (focus !== undefined) {
      switch (focus.type) {
        case AppConstants.ObjectType.Member:
          pedigreeButtons.addSpouse = <Button onClick={this.addSpouse}>Add spouse</Button>;
          if (pedigree.members.get(focus.key).parents.size) {
            // TODO: add twin with zygosity information.
            pedigreeButtons.addTwin = <Button onClick={this.addTwin}>Add twin</Button>;
          } else {
            pedigreeButtons.addParents = <Button onClick={this.addParents}>Add parents</Button>;
          }

          // TODO: should we cache this?
          // this is recalculated everytime we switch focus between members.
          // but this property based on the member is key is probably not changed.
          canDelete = pedigree.nests.every((nest, nestKey) => {
            var mateKey;
            var mate;
            if (nestKey.has(focus.key)) {
              // has spouse
              if (nest.pregnancies.size) {
                // has children
                return false;
              } else {
                // no children. Is the mate connected with other members?
                mateKey = nestKey.delete(focus.key).first();
                mate = pedigree.members.get(mateKey);
                if (mate.parents.size) {
                  return true;
                } else {
                  // true if mate has other mates.
                  return pedigree.nests
                    .some((n, nk) => n !== nest && nk.has(mateKey));
                }
              }
            } else {
              // no spouse
              return true;
            }
          });

          if (canDelete) {
            pedigreeButtons.deleteMember = <Button onClick={this.deleteMember}>Delete member</Button>;
          }

          break;

        case AppConstants.ObjectType.Nest:
          pedigreeButtons.addChild = <DropdownButton onSelect={this.addChild} title="Add child">
                                       <MenuItem eventKey={AppConstants.Gender.Male}>Male</MenuItem>
                                       <MenuItem eventKey={AppConstants.Gender.Female}>Female</MenuItem>
                                       <MenuItem eventKey={AppConstants.Gender.Unknown}>Unknown</MenuItem>
                                     </DropdownButton>;
          break;
      }
    }

    return (
      <div>
        <ButtonGroup>
          {React.addons.createFragment(documentButtons)}
        </ButtonGroup>
        <ButtonGroup>
          {React.addons.createFragment(pedigreeButtons)}
        </ButtonGroup>
      </div>
    );
  }
});


module.exports = DocumentControls;
