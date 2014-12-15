var Kinetic = require('kinetic');
var Legend = require('./Legend.js');

var Stage = function(config) {
  this.drawingLayer = undefined;
  this.legendLayer = undefined;
  this.showLegend = false;
  this.init(config);
};

Stage.prototype = {
  init: function(config) {
    Kinetic.Stage.call(this, config);

    this.drawingLayer = new Kinetic.Layer({});

    // hide legend by default
    this.legendLayer = new Kinetic.Layer({
      visible: false
    });

    this.add(this.drawingLayer, this.legendLayer);
  },

  // Draw legend on stage.
  drawLegend: function() {
    var legend = new Legend();
    this.legendLayer.add(legend);
    this.legendLayer.visible(true);
    this.legendLayer.draw();
  }
};
Kinetic.Util.extend(Stage, Kinetic.Stage);

module.exports = Stage;
