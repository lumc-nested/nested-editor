'use strict';

var React = require('react');
var _ = require('lodash');

var Pedigree = require('../core/Pedigree.js');
var Member = require('../core/Member.js');
var Nest = require('../core/Nest.js');
var Pregnancy = require('../core/Pregnancy.js');

var Individual = Member.Individual;
var Group = Member.Group;

var _counter = 0;

var _newId = function() {
  _counter += 1;
  return _counter;
};

var parse = function(text) {
  var document = JSON.parse(text);

  var members = {};

  // Create member objects.
  _.each(document.members, function(memberProps) {
    if (_.has(memberProps, "numberOfIndividuals")) {
      members[memberProps._id] = new Group(memberProps);
    } else {
      members[memberProps._id] = new Individual(memberProps);
    }
  });

  // Create nest objects.
  var nests = _.map(document.nests, function(nestProps) {
    var father = members[nestProps.father];
    var mother = members[nestProps.mother];

    var pregnancies = _.map(nestProps.pregnancies, function(pregProps) {
      var zygotes = _.map(pregProps.zygotes, function(zygote) {
        var child = members[zygote];
        return child;
      });

      return new Pregnancy(zygotes);
    });

    // Create a nest.
    return new Nest(father, mother, pregnancies, nestProps.consanguenous);
  });

  return new Pedigree(members, nests);
};

module.exports = {"parse": parse};
