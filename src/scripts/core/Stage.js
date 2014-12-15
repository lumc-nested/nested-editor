var Kinetic = require('kinetic');
var _ = require('lodash');
var Legend = require('./Legend.js');
var Member = require('./Member.js');

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
  },

  // Draw family on stage.
  // TODO: location of the members are hard coded.
  drawFamily: function(family) {
    var layer = this.drawingLayer;
    _.each(family.members, function(data, index){
      var member = new Member(data);
      member.setPosition({x: 200 + index * 50, y: 200});
      layer.add(member);
    });

    layer.draw();
  }
};
Kinetic.Util.extend(Stage, Kinetic.Stage);

module.exports = Stage;
