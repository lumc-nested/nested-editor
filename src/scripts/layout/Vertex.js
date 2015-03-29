'use strict';

var Vertex = function(id) {
  this.id = id;

  // parent nest
  this.lowerIn = undefined;

  // mating nests
  this.upperIn = [];

  // sib index
  this.lowerEdgeIndex = undefined;

  // leftmost in the lower edge of a HyperEdge or in a vertex group.
  this.leftmost = false;

  // right in the lower edge of a HyperEdge or in a vertex group.
  this.rightmost = false;

  // y coordinate
  this.level = undefined;

  // x coordinate
  this.position = undefined;
};

Vertex.prototype = {

  guessPosition: function() {
    if (this.left !== undefined && this.left.position !== undefined) {
      this.adjustPosition(this.left.position + 1);
    } else {
      this.position = 0;
    }
  },

  adjustPosition: function(position) {
    // can only increase the position.
    if (this.position !== undefined) {
      this.position = Math.max(this.position, position);
    } else {
      this.position = position;
    }
  },

  layout: function() {
    return {
      position: this.position,
      level: this.level,
      index: this.lowerEdgeIndex
    };
  },

  toString: function() {
    return this.id;
  }
};

module.exports = Vertex;
