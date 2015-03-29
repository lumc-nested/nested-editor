'use strict';

var HyperEdge = require('./HyperEdge');
var Utils = require('../common/Utils');
var Vertex = require('./Vertex');
var VertexGroup = require('./VertexGroup');


var HyperGraph = function(data) {
  this.vertices = {};
  this.hyperEdges = [];
  this.init(data);
};

HyperGraph.prototype = {
  init: function(data) {

    // Create vertices.
    this.vertices = data.members
      .map((member, memberKey) => new Vertex(memberKey))
      .toJS();

    // Create nest objects.
    this.hyperEdges = data.nests
      .map((nest, nestKey) => {
        var [left, right] = Utils.getFatherAndMother(nestKey, data.members);

        var lowerGroups = nest.pregnancies
          .map(pregnancy => new VertexGroup(
            pregnancy.children.map(child => this.vertices[child]).toJS()))
          .toJS();

        return new HyperEdge(
          this.vertices[left],
          this.vertices[right],
          lowerGroups);
      })
      .toList()
      .toJS();

    Object.keys(this.vertices).forEach(id => {
      var vertex = this.vertices[id];

      if (vertex.upperIn.length === 1) {
        if (vertex.upperIn[0].shouldFlip()) {
          vertex.upperIn[0].flip();
        }
      } else if (vertex.upperIn.length === 2) {

        if (vertex.upperIn[0].shouldFlip()) {
          // flip the first one.
          vertex.upperIn[0].flip();

          // do not touch the second one.
          // TODO: if second one also needs to be flipped.
          //       we need to create pointer objects.

        } else if (vertex.upperIn[1].shouldFlip()) {
          // flip the second one.
          vertex.upperIn[1].flip();
        } else {
          // if both hyper edges are still on the same side of the vertex.
          if (vertex.upperIn[0].upperLeft === vertex.upperIn[1].upperLeft ||
              vertex.upperIn[0].upperRight === vertex.upperIn[1].upperRight) {
            // just flip the first one.
            vertex.upperIn[0].flip();
          }
        }

        // make sure that vertex is on the right side of the first edge
        // and left side of the second edge.
        if (vertex.upperIn[0].upperLeft === vertex ||
            vertex.upperIn[1].upperRight === vertex) {
          vertex.upperIn.reverse();
        }
      }

      // TODO: create pointer objects for vertex with more than three hyper edges.
    });

    console.log(this);
  },

  layout: function() {
    return {
      vertices: this.vertices.map(vertex => vertex.layout()),
      hyperEdges: this.hyperEdges.map(edge => edge.layout())
    };
  }
};

module.exports = HyperGraph;
