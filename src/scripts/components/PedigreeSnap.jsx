var React = require('react');
var Snap = require('snapsvg');
var _ = require('lodash');


var _svgID, _svg, memmberLocationProperties;
_svgID = 'pedigree-canvas';


/**
  * This is not working. Snap.svg doesn't load properly with webpack.
  *
  * It is probably caused by webpack shimming some functions related
  * to eve (or Snap.svg did not load eve with CommonJS or something).
  */

var PedigreeSnapSVG = React.createClass({

  componentDidMount: function(){
    console.log("here");
  },

  render: function() {
    return (
      <svg id={_svgID} width="800" height="650" />
    );
  }
});

module.exports = PedigreeSnapSVG;
