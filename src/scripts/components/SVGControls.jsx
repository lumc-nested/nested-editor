'use strict';

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var AppActions = require('../actions/AppActions');
var PedigreeParser = require('../parsers/PedigreeParser.js');
var PedParser = require('../parsers/PedParser.js');
var PC = require('../constants/PedigreeConstants');

var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;
var Button = ReactBootstrap.Button;
var ButtonGroup = ReactBootstrap.ButtonGroup;


var Controls = React.createClass({
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

  render: function() {
    // Note: The `accept` attribute with file extensions only works in
    //   Google Chrome and Internet Explorer 10+.
    var buttons = {};

    buttons.loadPedigree = <Button className="btn-file">
                              Load pedigree
                              <input type="file" accept=".json,.ped" onChange={this.loadPedigree} />
                           </Button>;

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
        <ButtonGroup>
          {buttons}
        </ButtonGroup>
      </div>
    );
  }
});


// CSS
require('../../styles/svgControls.less');


module.exports = Controls;
