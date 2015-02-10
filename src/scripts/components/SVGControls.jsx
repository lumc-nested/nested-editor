'use strict';

var React = require('react');
var AppActions = require('../actions/AppActions');
var PedigreeParser = require("../parsers/PedigreeParser.js");
var PedParser = require("../parsers/PedParser.js");
var PC = require("../constants/PedigreeConstants");

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
      if (file.name.split(".").pop() === "ped") {
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
    AppActions.addChild();
  },

  render: function() {
    // Note: The `accept` attribute with file extensions only works in
    //   Google Chrome and Internet Explorer 10+.
    var buttons = [
      <span key="loadPedigree" className="btn btn-default btn-file">
        Load pedigree <input type="file" accept=".json,.ped" onChange={this.loadPedigree} />
      </span>
    ];

    if (this.props.focus !== undefined) {
      switch (this.props.focus.level) {
        case PC.FocusLevel.Member:
          buttons.push(
            <button key="addSpouse" type="button" className="btn btn-default" onClick={this.addSpouse}>Add spouse</button>
          );
          break;

        case PC.FocusLevel.Nest:
          buttons.push(
            <button key="addChild" type="button" className="btn btn-default" onClick={this.addChild}>Add child</button>
          );
          break;
      }
    }

    return (
      <div id="svg-controls">
        <div className="btn-group" role="group" aria-label="..." >
          {buttons}
        </div>
      </div>
    );
  }
});


module.exports = Controls;
