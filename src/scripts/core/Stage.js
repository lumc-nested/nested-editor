var Kinetic = require('kinetic');
var _ = require('lodash');
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
      listening: false,
      visible: false
    });

    this.add(this.drawingLayer, this.legendLayer);
  },

  // Draw legend on stage.
  // TODO: only show shapes used in current drawing.
  drawLegend: function() {
    var legend, border, padding, symbols;

    padding = 10;

    legend = new Kinetic.Group({
      x: 20,
      y: 20,
      draggable: true
    });

    // currently supported symbols.
    symbols = [
      [new Kinetic.Text({text: 'Male', fill: '#333', fontSize: 16}), new Member({'gender': 1})],
      [new Kinetic.Text({text: 'Female', fill: '#333', fontSize: 16}), new Member({'gender': 2})],
      [new Kinetic.Text({text: 'Gender unknown', fill: '#333', fontSize: 16}), new Member({'gender': 0})],
      [new Kinetic.Text({text: 'Deceased', fill: '#333', fontSize: 16}), new Member({'gender': 1, 'deceased': true})]
    ];

    // set symbol location and add to the legend group.
    _.each(symbols, function(symbol, index) {
      symbol[0].setPosition({x: padding + 50, y: index * 50 + padding + 13});
      symbol[1].setPosition({x: padding, y: index * 50 + padding});
      legend.add(symbol[0], symbol[1]);
    })

    border = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: 200,
      height: symbols.length * 50 + padding * 2,
      stroke: '#ccc',
      strokeWidth: 1
    });
    legend.add(border);

    // more space efficiency.
    legend.scale({x: 0.75, y: 0.75});

    this.legendLayer.add(legend);
    this.legendLayer.visible(true);
    this.legendLayer.draw();
  }
};

Kinetic.Util.extend(Stage, Kinetic.Stage);

module.exports = Stage;
