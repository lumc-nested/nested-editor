var FileSaver = require('FileSaver');
// Prevent including the FA stylesheet by a deep require of Icon.
var Icon = require('react-fa/lib/Icon');
var React = require('react');
var createFragment = require('react-addons-create-fragment');
var {Button, ButtonGroup, DropdownButton, MenuItem, OverlayTrigger, Tooltip} = require('react-bootstrap');

var ExcelWriter = require('../writers/ExcelWriter');
var JsonWriter = require('../writers/JsonWriter');
var PedWriter = require('../writers/PedWriter');

var DocumentActions = require('../actions/DocumentActions');
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

  addPartner: function() {
    DocumentActions.addPartner(this.props.focus.get('key'));
  },

  addChild: function(gender) {
    var {father, mother} = this.props.focus.get('key');
    DocumentActions.addChild(father, mother, gender);
  },

  addParents: function() {
    DocumentActions.addParents(this.props.focus.get('key'));
  },

  addTwin: function() {
    DocumentActions.addTwin(this.props.focus.get('key'));
  },

  deleteIndividual: function() {
    DocumentActions.deleteIndividual(this.props.focus.get('key'));
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
    var document = this.props.document;
    var focus = this.props.focus;
    var downloadItems;
    var tooltip;
    var canDelete;

    if (this.props.undo !== undefined) {
      tooltip = <Tooltip id="tooltip-undo">Undo: <strong>{this.props.undo}</strong></Tooltip>;
      documentButtons.undo = <OverlayTrigger placement="bottom" overlay={tooltip}>
                               <Button key="undo" onClick={this.undo}><Icon name="undo" /></Button>
                             </OverlayTrigger>;
    } else {
      documentButtons.undo = <Button key="undo" disabled><Icon name="undo" /></Button>;
    }

    if (this.props.redo !== undefined) {
      tooltip = <Tooltip id="tooltip-redo">Redo: <strong>{this.props.redo}</strong></Tooltip>;
      documentButtons.redo = <OverlayTrigger placement="bottom" overlay={tooltip}>
                               <Button key="redo" onClick={this.redo}><Icon name="repeat" /></Button>
                             </OverlayTrigger>;
    } else {
      documentButtons.redo = <Button key="redo" disabled><Icon name="repeat" /></Button>;
    }

    downloadItems = Object.keys(writers).map(
      produce => <MenuItem key={produce} eventKey={produce}>Save as .{produce}</MenuItem>
    );
    documentButtons.download = <DropdownButton
                                   id="dropdown-download"
                                   key="download"
                                   onSelect={(_, eventKey) => this.download(eventKey)}
                                   title={<Icon name="download" />}>
                                 {downloadItems}
                               </DropdownButton>;

    // todo loose the this.props prefix
    if (focus !== undefined) {
      switch (focus.type) {
        case 'individual':
          pedigreeButtons.addPartner = <Button onClick={this.addPartner}>Add partner</Button>;
          if (document.individuals.get(focus.key).get('father') && document.individuals.get(focus.key).get('mother')) {
            // TODO: add twin with zygosity information.
            pedigreeButtons.addTwin = <Button onClick={this.addTwin}>Add twin</Button>;
          } else {
            pedigreeButtons.addParents = <Button onClick={this.addParents}>Add parents</Button>;
          }

          // TODO: should we cache this?
          // this is recalculated everytime we switch focus between individuals.
          // but this property based on the individual is key is probably not changed.
          canDelete = !document.individuals.some((individual, individualKey) =>
            !individualKey.startsWith('^') && (individual.get('father') === focus.key ||
                                               individual.get('mother') === focus.key)
          );

          if (canDelete) {
            pedigreeButtons.deleteIndividual = <Button onClick={this.deleteIndividual}>Delete individual</Button>;
          }

          break;

        case 'mating':
          pedigreeButtons.addChild = <DropdownButton
                                         id="dropdown-add-child"
                                         onSelect={(_, gender) => this.addChild(gender)}
                                         title="Add child">
                                       <MenuItem eventKey="male">Male</MenuItem>
                                       <MenuItem eventKey="female">Female</MenuItem>
                                       <MenuItem eventKey="unknown">Unknown</MenuItem>
                                     </DropdownButton>;
          break;
      }
    }

    return (
      <div>
        <ButtonGroup>
          {createFragment(documentButtons)}
        </ButtonGroup>
        <ButtonGroup>
          {createFragment(pedigreeButtons)}
        </ButtonGroup>
      </div>
    );
  }
});


module.exports = DocumentControls;
