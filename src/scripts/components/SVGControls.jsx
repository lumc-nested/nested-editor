'use strict';

var React = require('react');
var AppActions = require('../actions/AppActions');
var PedigreeParser = require("../parsers/PedigreeParser.js");

// CSS
require('../../styles/svgControls.less');

var Controls = React.createClass({
  loadPedigree: function(e) {
    var reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = function(e) {
      var pedigree = PedigreeParser.parse(e.target.result);
      AppActions.loadPedigree(pedigree);
    }.bind(this);

    if (file) {
      reader.readAsText(file);
    }
  },

  addSpouse: function() {
    AppActions.addSpouse();
  },

  render: function() {
    var buttons = [
      <span key="loadPedigree" className="btn btn-default btn-file">
        Load pedigree <input type="file" onChange={this.loadPedigree} />
      </span>
    ];

    if (typeof this.props.selected !== 'undefined') {
      buttons.push(
        <button key="addSpouse" type="button" className="btn btn-default" onClick={this.addSpouse}>Add spouse</button>
      );
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
