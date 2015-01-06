'use strict';

var React = require('react');
var Kinetic = require('kinetic');
var PedigreeUI = require('../core/UI.js');

var _canvasID = 'pedigree-canvas';
var _stage;

var PedigreeCanvas = React.createClass({

  shouldComponentUpdate: function(nextProps, nextState) {
    // let Kinetic handle the update.
    _stage.update(nextProps);

    return false;
  },

  componentDidMount: function() {
    _stage = new PedigreeUI.Stage({
      width: 800,
      height: 650,
      container: _canvasID
    });

    _stage.drawLegend();

    _stage.drawFamily(this.props.family);
  },

  render: function() {
    console.log('render canvas component');
    return (
      <div id={_canvasID}></div>
    );
  }
});

module.exports = PedigreeCanvas;

