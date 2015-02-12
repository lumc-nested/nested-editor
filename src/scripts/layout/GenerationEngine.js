'use strict';

var _ = require('lodash');
var Constants = require('../constants/PedigreeConstants.js');

var GenerationEngine = function(graph) {
  this.graph = graph;
};

var _addMemberToGeneration = function(generations, index, member) {
  if (generations[index] === undefined) {
    generations[index] = [member];
  } else {
    // for tracking the order within a generation.
    // TODO: what if the order here is not optimal?
    member.left = _.last(generations[index]);
    generations[index].push(member);
  }
};

var _determineChildrenGenerations = function(children, generationIndex, generations) {
  _.each(children, function(child) {
    if (!child.hasMates()) {
      _addMemberToGeneration(generations, generationIndex, child);
    } else {
      if (child.matingNests.length === 1) {
        // by default, father should be the left of the mother,
        // except:
        // 1. child is the oldest male sibling and his mate has parents.
        // 2. child is the youngest female sibling and her mate has parents.
        var mateNest = child.matingNests[0];

        if (mateNest.shouldFlip()) {
          _addMemberToGeneration(generations, generationIndex, mateNest.mother);
          _addMemberToGeneration(generations, generationIndex, mateNest.father);
        } else {
          _addMemberToGeneration(generations, generationIndex, mateNest.father);
          _addMemberToGeneration(generations, generationIndex, mateNest.mother);
        }

        _determineChildrenGenerations(mateNest.children(), generationIndex + 1, generations);
      }
    }
  });
};

var _determinParentsGenerations = function(nest, generationIndex, generations) {
  var parents = nest.shouldFlip() ? [nest.mother, nest.father] : [nest.father, nest.mother];

  _.each(parents, function(parent) {
    // go up if it is possible
    var parentsGenerations = [generationIndex];
    if (parent.hasParents()) {
      parentsGenerations.push(_determinParentsGenerations(parent.parentNest, generationIndex, generations));
    }

    // add self.
    _addMemberToGeneration(generations, _.max(parentsGenerations), parent);
  });

  return generationIndex + 1;
};

GenerationEngine.prototype = {

  findBridgeNests: function() {
    var bridges = _.filter(this.graph.nests, function(nest) {
      return nest.father.hasParents() && nest.mother.hasParents();
    });

    console.assert(bridges.length < 2, 'More than one bridge nest found.');
    return bridges[0];
  },

  findRootNest: function() {
    var roots = _.filter(this.graph.nests, function(nest) {
      return !nest.father.hasParents() && !nest.mother.hasParents();
    });

    console.assert(roots.length === 1, 'More than one root nest found.');
    return roots[0];
  },

  determineGenerations: function() {
    var generations = [];
    var startingNest = this.findBridgeNests();

    if (startingNest === undefined) {
      // then start from the root.
      startingNest = this.findRootNest();
    }

    var generationIndex = _determinParentsGenerations(startingNest, 0, generations);
    _determineChildrenGenerations(startingNest.children(), generationIndex + 1, generations);

    console.log(generations);
    return generations;
  }

};

module.exports = GenerationEngine;
