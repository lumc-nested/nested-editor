'use strict';

var _ = require('lodash');
var PC = require('../constants/PedigreeConstants.js');

function doLayout(family) {

  // 1. loop through all nests and determin generation sequence.
  var generations = [[]];
  _.each(family.nests, function(nest){
    var parents = [nest.father, nest.mother];
    var children = _.flatten(_.pluck(nest.pregnancies, "zygotes"));

    var parentGenerationIndex = _.max(_.map(generations, function(current, index) {
      if (_.intersection(parents, current).length > 0) {
        return index;
      }

      if (_.intersection(children, current).length > 0) {
        return index - 1;
      }

      return -1;
    }));

    // TODO: insert members in the correct order.
    if (parentGenerationIndex === -1) {
      // no match
      generations.splice(0, 0, parents); // insert parent generation.
      // TODO:
      generations[1] = _.union(generations[1], children); // update child generation.
    } else {
      // found parents in the known generations.

      // update parent generation.
      // TODO: handle member with multiple partners.
      var fatherIndex, motherIndex;
      fatherIndex = generations[parentGenerationIndex].indexOf(nest.father);
      if (fatherIndex >= 0) {
        generations[parentGenerationIndex].splice(fatherIndex + 1, 0, nest.mother);
      } else {
        motherIndex = generations[parentGenerationIndex].indexOf(nest.mother);
        generations[parentGenerationIndex].splice( motherIndex, 0, nest.father);
      }

      // TODO:
      generations[parentGenerationIndex + 1] = _.union(generations[parentGenerationIndex + 1], children); // update child generation.
    }
  });

  // 2. determine member locationgs based on its order in a generation.
  var locations = [];
  _.each(generations, function(gen, i) {
    _.each(gen, function(p, j) {
      // TODO: Current approach is too naive.
      locations.push({
        _id: p,
        x: 100 + j * PC.MemberDistance,
        y: 100 + i * PC.GenerationDistance
      });
    });
  });

  // 3. determine connections between members based on members' locations and the type of relationship.
  var partners = [];
  var offsprings = [];

  _.each(family.nests, function(nest) {
    var f = _.find(locations, {_id: nest.father});
    var m = _.find(locations, {_id: nest.mother});

    partners.push([f.x, f.y, m.x, m.y]);

    _.each(nest.pregnancies, function(preg) {
      _.each(preg.zygotes, function(child) {
        var c = _.find(locations, { _id: child });
        offsprings.push([
          Math.min(f.x, m.x) + Math.abs(m.x - f.x) / 2,
          Math.min(f.y, m.y) + Math.abs(m.y - f.y) / 2,
          c.x,
          c.y
        ]);
      });
    });
  });


  return {
    'generations': generations,
    'locations': locations,
    'partners': partners,
    'offsprings': offsprings
  };
}

module.exports = doLayout;
