'use strict';

var React = require('react');
var Kinetic = require('kinetic');
var PedigreeUI = require('../core/UI.js');
var _stage, _layer, _canvasID;

_canvasID = 'pedigree-canvas';

var PedigreeCanvas = React.createClass({

  componentDidMount: function() {
    var _stage = new Kinetic.Stage({
      width: 650,
      height: 650,
      container: _canvasID,
      fill: 'white'
    });

    var _layer = new Kinetic.Layer({});

    var male = new PedigreeUI.Member({'gender': 1});
    male.setPosition({x: 100, y: 100});
    var female = new PedigreeUI.Member({'gender': 2});
    female.setPosition({x: 100, y: 200});
    var unknownGender = new PedigreeUI.Member({'gender': 0});
    unknownGender.setPosition({x: 100, y: 300});

    _layer.add(male, female, unknownGender);
    _stage.add(_layer);
  },

  render: function() {
    return (
      <div id={_canvasID}></div>
    );
  }
});

module.exports = PedigreeCanvas;

