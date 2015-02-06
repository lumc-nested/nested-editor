'use strict';

var _ = require('lodash');
var Member = require('./Member.js');
var Nest = require('./Nest.js');
var Pregnancy = require('./Pregnancy.js');

var Individual = Member.Individual;
var Group = Member.Group;

var Pedigree = function(data) {
  /*
    Todo:

    For the members structure, I think we should choose one of:

    1. An array of objects where the objects all have an "_id" field.
    2. An associative array of objects where the ID of the object is its key.

    We probably shouldn't have both (as we have now?).
  */
  this.members = {};
  this.nests = [];

  this.init(data);
};

Pedigree.prototype = {

  init: function(data) {

    var members = {};

    // Create member objects.
    _.each(data.members, function(memberProps) {
      if (_.has(memberProps, "numberOfIndividuals")) {
        members[memberProps._id] = new Group(memberProps);
      } else {
        members[memberProps._id] = new Individual(memberProps);
      }
    });

    this.members = members;


    // Create nest objects.
    var nests = _.map(data.nests, function(nestProps) {
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

    this.nests = nests;
  }

};

module.exports = Pedigree;
