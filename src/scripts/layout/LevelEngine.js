var LevelEngine = function() {
  this.levels = {};
};

LevelEngine.prototype = {

  addVertexToLevel: function(index, vertex) {
    if (vertex.level === undefined) {
      if (this.levels[index] === undefined) {
        this.levels[index] = [vertex];
      } else {
        // for tracking the order within a generation.
        // TODO: what if the order here is not optimal?
        vertex.left = this.levels[index][this.levels[index].length - 1];
        this.levels[index].push(vertex);
      }

      // console.debug(`LevelEngine: add vertex ${vertex} to level ${index}`);
      vertex.level = index;
    } else {
      // TODO: this may be expected for some consanguenous relationships.
      console.assert(vertex.level === index,
        'vertex level is already assigned to a different value.');
    }
  },

  determinHyperEdgeLevel: function(hyperEdge, levelIndex) {
    var lowerVertices = [];
    if (hyperEdge.level === undefined) {

      lowerVertices = hyperEdge.lowerVertices();

      levelIndex = levelIndex ||
                   hyperEdge.upperLeft.level || hyperEdge.upperRight.level ||
                   lowerVertices.reduce((a, b) => a || b.level + 1, undefined) ||
                   0;

      // go left.
      hyperEdge.upperLeft.upperIn
        .filter(e => e.upperRight === hyperEdge.upperLeft)
        .forEach(e => this.determinHyperEdgeLevel(e, levelIndex));
      this.addVertexToLevel(levelIndex, hyperEdge.upperLeft);


      // go up.
      hyperEdge.getUpper()
        .forEach(vertex => {
          if (vertex.lowerIn) {
            this.determinHyperEdgeLevel(vertex.lowerIn, levelIndex - 1);
          }
        });

      // add self.
      // set as visited.
      hyperEdge.level = levelIndex;
      console.debug(`LevelEngine: visiting edge [${hyperEdge}]`);

      // go right.
      this.addVertexToLevel(levelIndex, hyperEdge.upperRight);
      hyperEdge.upperRight.upperIn
        .filter(e => e.upperLeft === hyperEdge.upperRight)
        .forEach(e => this.determinHyperEdgeLevel(e, levelIndex));

      // go down.
      lowerVertices
        .forEach(vertex => {
          vertex.upperIn.forEach(e => this.determinHyperEdgeLevel(e, levelIndex + 1));

          // if it is already added from the upperIn edges,
          // this will do nothing.
          this.addVertexToLevel(levelIndex + 1, vertex);
        });
    }
  },

  determineLevels: function(hyperGraph) {
    var minLevel;

    hyperGraph.hyperEdges
      .filter(e => e.upperLeft.lowerIn && e.upperRight.lowerIn)
      .forEach(e => this.determinHyperEdgeLevel(e));

    hyperGraph.hyperEdges
      .filter(e => e.upperLeft.lowerIn === undefined && e.upperRight.lowerIn === undefined)
      .forEach(e => this.determinHyperEdgeLevel(e));

    console.info('levels: ', this.levels);

    minLevel = Math.min.apply(null, Object.keys(this.levels));
    if (minLevel < 0) {
      // adjust the levels to start from 0.
      hyperGraph.hyperEdges.forEach(hyperEdge => hyperEdge.level -= minLevel);
      Object.keys(hyperGraph.vertices).forEach(
        key => hyperGraph.vertices[key].level -= minLevel);
    }
  }
};

module.exports = LevelEngine;
