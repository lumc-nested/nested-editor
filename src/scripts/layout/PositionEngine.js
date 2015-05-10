var PositionEngine = function() {};

PositionEngine.prototype = {

  arrangePositions: function(hyperGraph) {
    hyperGraph.hyperEdges
      .sort((e1, e2) => e1.level > e2.level)
      .forEach(e => this.arrangeHyperEdge(e));

    // handle vertices not in any nests.
    Object.keys(hyperGraph.vertices)
      .forEach(key => {
        var vertex = hyperGraph.vertices[key];
        if (vertex.position === undefined) {
          vertex.guessPosition();
        }
      });
  },

  arrangeHyperEdge: function(hyperEdge) {
    var lowerVertices = [];
    var center;

    if (hyperEdge.position === undefined) {
      console.debug(`PositionEngine: visiting edge [${hyperEdge}]`);
      lowerVertices = hyperEdge.lowerVertices();


      // go left.
      hyperEdge.upperLeft.upperIn
        .filter(e => e.upperRight === hyperEdge.upperLeft)
        .forEach(e => this.arrangeHyperEdge(e));
      hyperEdge.upperLeft.guessPosition();

      // set visited.
      hyperEdge.guessPosition();

      // go down.
      lowerVertices
        .forEach(v => {
          if (v.upperIn.length) {
            v.upperIn.forEach(e => this.arrangeHyperEdge(e));
          } else {
            v.guessPosition();
          }
        });

      if (lowerVertices.length) {
        center = (lowerVertices[lowerVertices.length - 1].position + lowerVertices[0].position) / 2;
        if (center > hyperEdge.position) {
          // center upper edge based on lower edge.
          this.shiftUpper(hyperEdge, center);
        } else if (center < hyperEdge.position) {
          // center lower edge based on upper edge.
          this.shiftLower(hyperEdge, hyperEdge.position - center);
        }
      }
      console.debug(`PositionEngine: set edge [${hyperEdge}]`);

      // go right.
      hyperEdge.upperRight.guessPosition();
      hyperEdge.upperRight.upperIn
        .filter(e => e.upperLeft === hyperEdge.upperRight)
        .forEach(e => this.arrangeHyperEdge(e));

      // go up.
      hyperEdge.getUpper()
        .forEach(v => {
          if (v.lowerIn) {
            this.arrangeHyperEdge(v.lowerIn);
          }
        });
      hyperEdge.guessPosition();

      console.debug(`PositionEngine: visted edge [${hyperEdge}]`);
    }
  },

  shiftUpper: function(hyperEdge, to) {
    hyperEdge.position = to;
    hyperEdge.upperLeft.adjustPosition(to - 0.5);
    hyperEdge.upperRight.adjustPosition(to + 0.5);
  },

  shiftLower: function(hyperEdge, shift) {
    hyperEdge.lowerVertices()
      .forEach(vertex => {
        vertex.position += shift;
        vertex.upperIn.forEach(e => {
          e.position += shift;
          e.getUpper().filter(v => v !== vertex).forEach(v => v.position += shift);
          this.shiftLower(e, shift);
        });
      });
  }
};

module.exports = PositionEngine;
