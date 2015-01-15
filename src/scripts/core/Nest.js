'use strict';

var _ = require('lodash');

var Nest = function(father, mother, pregnancies, consanguenous) {
  this.father = father;
  this.mother = mother;
  this.pregnancies = pregnancies;
  this.consanguenous = consanguenous;

  // private
  var children;

  // function to access the private children property.
  this.children = function() {
    if (children === undefined) {
      children = _.flatten(_.pluck(this.pregnancies, "zygotes"));
    }
    return children;
  };

  this.populateRelationships();
};

Nest.prototype = {

  populateRelationships: function() {
    // flattened children list.
    var children = this.children();

    // add parents' relationships.
    this.father.addSpouse(this.mother);
    this.father.addChildren(children);
    this.mother.addSpouse(this.father);
    this.mother.addChildren(children);

    _.each(children, function(child, index) {
      child.sibIndex = index;

      // child's relationships with other family membes.
      child.father = this.father;
      child.mother = this.mother;

      // link to slibings.
      child.siblings = _.where(children, function(c) { return c._id !== child._id; });
    }, this);
  }
};

module.exports = Nest;
