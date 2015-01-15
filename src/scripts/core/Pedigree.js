'use strict';

var _ = require('lodash');
var Member = require('./Member.js');
var Nest = require('./Nest.js');
var Pregnancy = require('./Pregnancy.js');

var Individual = Member.Individual;
var Group = Member.Group;

/**
 * Pedigree object based on the JSON data.
 */

var Pedigree = function(data) {
  this.data = data;
  this.members = {};
  this.nests = [];
  this.init(data);
};

Pedigree.prototype = {
  init: function(data) {
    var that = this;

    // create member objects.
    _.each(data.members, function(memberProps) {
      if (_.has(memberProps, "numberOfIndividuals")) {
        that.members[memberProps._id] = new Group(memberProps);
      } else {
        that.members[memberProps._id] = new Individual(memberProps);
      }
    });

    // creat nest objects.
    _.each(data.nests, function(nestProps) {

      var father = that.members[nestProps.father];
      var mother = that.members[nestProps.mother];

      var pregnancies = _.map(nestProps.pregnancies, function(pregProps) {
        var zygotes = _.map(pregProps.zygotes, function(zygote) {
          var child = that.members[zygote];
          return child;
        });

        return new Pregnancy(zygotes);
      });

      // create a nest.
      var nest = new Nest(father, mother, pregnancies, nestProps.consanguenous);

      // flattened children list.
      var children = nest.children();

      // add parents' relationships.
      father.addSpouse(mother);
      father.addChildren(children);
      mother.addSpouse(father);
      mother.addChildren(children);

      _.each(children, function(child, index) {
        child.sibIndex = index;

        // child's relationships with other family membes.
        child.father = father;
        child.mother = mother;

        // link to slibings.
        child.siblings = _.where(children, function(c) { return c._id !== child._id; });
      });

      // add nest to the pedigree.
      that.nests.push(nest);
    });
  }
};



module.exports = Pedigree;
