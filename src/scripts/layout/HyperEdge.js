var HyperEdge = function(upperLeft, upperRight, lowerGroups) {
  var lowerVertices;

  // parent (father)
  this.upperLeft = upperLeft;

  // parent (mother)
  this.upperRight = upperRight;

  // children
  this.lowerGroups = lowerGroups;

  // y coordinate
  this.level = undefined;

  // x coordinate
  this.position = undefined;

  // function to access private lowerVertices
  this.lowerVertices = function() {
    if (lowerVertices === undefined) {
      lowerVertices = this.lowerGroups.reduce((a, b) => a.concat(b.vertices), []);
    }
    return lowerVertices;
  };

  this.populate();
};

HyperEdge.prototype = {
  populate: function() {
    var lowerIndex = 0;

    this.upperLeft.upperIn.push(this);
    this.upperRight.upperIn.push(this);

    this.lowerGroups.forEach((vertexGroup, gi) => {
      vertexGroup.vertices.forEach((vertex, vi) => {
        vertex.lowerEdgeIndex = lowerIndex;
        vertex.lowerIn = this;

        if (vertexGroup.vertices.length > 1) {
          vertex.leftmost = vi === 0;
          vertex.rightmost = vi === vertexGroup.vertices.length - 1;
        }

        if (this.lowerGroups.length > 1) {
          vertex.leftmost = vertex.leftmost || gi === 0;
          vertex.rightmost = vertex.rightmost || gi === this.lowerGroups.length - 1;
        }

        // update index
        lowerIndex += 1;
      });
    });
  },

  getUpper: function() {
    return [this.upperLeft, this.upperRight].filter(v => v !== undefined);
  },

  setUpper: function(left, right) {
    this.upperLeft = left;
    this.upperRight = right;
  },

  shouldFlip: function() {
    return ((this.upperLeft.leftmost && this.upperRight.lowerIn) ||
            (this.upperRight.rightmost && this.upperLeft.lowerIn));
  },

  flip: function() {
    this.setUpper(this.upperRight, this.upperLeft);
  },

  layout: function() {
    return {
      position: this.position,
      level: this.level || this.upperRight.level,
      groups: this.lower.map(group => group.layout())
    };
  },

  guessPosition: function() {
    console.assert(this.upperLeft.position !== undefined,
                   'try to guess edge position before upper left vertex is set.');
    if (this.upperRight.position !== undefined) {
      this.adjustPosition((this.upperLeft.position + this.upperRight.position) / 2);
    } else {
      this.adjustPosition(this.upperLeft.position + 0.5);
    }
  },

  adjustPosition: function(position) {
    if (this.position !== undefined) {
      this.position = Math.max(this.position, position);
    } else {
      this.position = position;
    }

    this.upperLeft.adjustPosition(this.position - 0.5);
    this.upperRight.adjustPosition(this.position + 0.5);
  },

  toString: function() {
    return this.getUpper().join(',');
  }
};

module.exports = HyperEdge;
