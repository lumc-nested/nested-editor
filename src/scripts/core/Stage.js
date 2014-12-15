var Kinetic = require('kinetic');
var _ = require('lodash');
var PC = require('../constants/PedigreeConstants.js');
var Legend = require('./Legend.js');
var Member = require('./Member.js');
var Nest = require('./Nest.js');

var _members = [];

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

    _members = _.map(family.members, function(data) {
      return new Member(data);
    });

    _nests = _.map(family.nests, function(data) {
      return new Nest(data, _members);
    });

    _.each(_nests, function(nest, index) {
      nest.doLayout();
      nest.setPosition({x: 300 + index * 200, y: 200});
      layer.add(nest);
    });

    layer.draw();
  }
};
Kinetic.Util.extend(Stage, Kinetic.Stage);

module.exports = Stage;
