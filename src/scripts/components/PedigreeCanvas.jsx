'use strict';

var React = require('react');
var Kinetic = require('kinetic');
var PedigreeUI = require('../core/UI.js');
var _stage, _canvasID;

_canvasID = 'pedigree-canvas';

var PedigreeCanvas = React.createClass({

  componentDidMount: function() {
    var stage = new PedigreeUI.Stage({
      width: 800,
      height: 650,
      container: _canvasID
    });

    stage.drawLegend();

    stage.drawFamily({
      "members": [
        {
          "id": 1,
          "gender": 1
        },
        {
          "id": 2,
          "gender": 2
        }
      ]
    });

  },

  render: function() {
    return (
      <div id={_canvasID}></div>
    );
  }
});

module.exports = PedigreeCanvas;

