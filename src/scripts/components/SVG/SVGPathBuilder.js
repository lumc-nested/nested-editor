'use strict';


// ESLint seems confused in template strings.
/*eslint-disable comma-spacing */


var SVGPathBuilder = function() {
  this.array = [];
};

SVGPathBuilder.prototype = {
  moveTo: function(x, y, abs) {
    var action = abs || true ? 'M' : 'm';
    this._add(action, x, y);
  },

  lineTo: function(x, y, abs) {
    var action = abs || true ? 'L' : 'l';
    this._add(action, x, y);
  },

  _add: function(action, x, y) {
    this.array.push(`${action}${x},${y}`);
  },

  toString: function() {
    return this.array.join('');
  }
};

module.exports = SVGPathBuilder;
