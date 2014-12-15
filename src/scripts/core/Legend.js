var Kinetic = require('kinetic');
var _ = require('lodash');
var Member = require('./Member.js');


var Symbol = function(label, member) {
  this.label = new Kinetic.Text({text: label, fill: '#333', fontSize: 16});
  this.shape = new Member(member);
}

var Legend = function(symbols) {
  Kinetic.Group.call(this, {
    x: 20,
    y: 20,
    draggable: true,
    scale: {x: 0.75, y: 0.75} // more space efficiency.
  });

  this.addSymbols(symbols);
  this.on('mouseover', this.mouseOver);
  this.on('mouseout', this.mouseOut);
};

Legend.prototype = {

  // TODO: only show shapes used in current drawing.
  addSymbols: function(symbols) {
    var padding = 10;

    // currently supported symbols.
    if (symbols === undefined) {
      symbols = [
        new Symbol('Male', {'gender': 1}),
        new Symbol('Female', {'gender': 2}),
        new Symbol('Gender unknown', {'gender': 0}),
        new Symbol('Deceased', {'gender': 1, 'deceased': true})
      ];
    }

    // set symbol location and add to the legend group.
    _.each(symbols, function(symbol, index) {
      symbol.label.setPosition({x: padding + 50, y: index * 50 + padding + 13});
      symbol.shape.setPosition({x: padding, y: index * 50 + padding});
      this.add(symbol.label, symbol.shape);
    }, this)

    this.add(new Kinetic.Rect({
      width: 200,
      height: symbols.length * 50 + padding * 2,
      stroke: '#ccc',
      strokeWidth: 1
    }));
  },

  mouseOver: function() {
    document.body.style.cursor = 'pointer';
  },

  mouseOut: function() {
    document.body.style.cursor = 'default';
  }
};
Kinetic.Util.extend(Legend, Kinetic.Group);

module.exports = Legend;
