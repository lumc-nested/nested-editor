'use strict';

var React = require('react');
var Kinetic = require('kinetic');
var PedigreeUI = require('../core/UI.js');
var _stage, _canvasID;

_canvasID = 'pedigree-canvas';

var PedigreeCanvas = React.createClass({

  componentDidMount: function() {
    var _stage = new PedigreeUI.Stage({
      width: 800,
      height: 650,
      container: _canvasID
    });

    _stage.drawLegend();
  },

  render: function() {
    return (
      <div id={_canvasID}></div>
    );
  }
});

module.exports = PedigreeCanvas;

