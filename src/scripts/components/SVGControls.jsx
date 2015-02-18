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

// CSS
require('../../styles/svgControls.less');

var Controls = React.createClass({
  loadPedigree: function(e) {
    var reader = new FileReader();
    var file = e.target.files[0];

    // Clear input element so we are called again even when re-opening the
    // same file.
    e.target.value = null;

    reader.onload = function(e) {
      var parser, pedigree;
      if (file.name.split('.').pop() === 'ped') {
        parser = PedParser;
      } else {
        parser = PedigreeParser;
      }
      pedigree = parser.parse(e.target.result);
      AppActions.loadPedigree(pedigree);
    }.bind(this);

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

    buttons.loadPedigree = <span key='loadPedigree' className='btn btn-default btn-file'>Load pedigree
                              <input type='file' accept='.json,.ped' onChange={this.loadPedigree} />
                           </span>;

    if (this.props.focus !== undefined) {
      switch (this.props.focus.level) {
        case PC.FocusLevel.Member:
          buttons.addSpouse = <Button key='addSpouse'
                                      onClick={this.addSpouse}>Add spouse</Button>;
          break;

        case PC.FocusLevel.Nest:

          buttons.addChild = <DropdownButton title='Add child'>
                              <MenuItem eventKey='1' onClick={this.addSon}>Male</MenuItem>
                              <MenuItem eventKey='2' onClick={this.addDaughter}>Female</MenuItem>
                              <MenuItem eventKey='2' onClick={this.addChild}>Unknown</MenuItem>
                            </DropdownButton>;
          break;
      }
    }

    return (
      <div id='svg-controls'>
        <div className='btn-group' role='group' aria-label='...' >
          {buttons}
        </div>
      </div>
    );
  }
});


module.exports = Controls;
