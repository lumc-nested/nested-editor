'use strict';

var _ = require('lodash');

var Nest = function(father, mother, pregnancies, consanguenous) {
  this.father = father;
  this.mother = mother;
  this.pregnancies = pregnancies;
  this.consanguenous = consanguenous;
  this.flip = false; // by default all nests show father to the left of mother

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
    this.father.addMatingNest(this);
    this.father.addChildren(children);

    this.mother.addChildren(children);
    this.mother.addMatingNest(this);

    _.each(children, function(child, index) {
      child.sibIndex = index;

      // child's relationships with other family membes.
      child.father = this.father;
      child.mother = this.mother;
      child.parentNest = this;

      // link to slibings.
      child.siblings = _.where(children, function(c) { return c._id !== child._id; });
    }, this);
  },

  shouldFlip: function() {
    // by default, father should be the left of the mother,
    // except:
    // 1. child is the oldest male sibling and his mate has parents.
    // 2. child is the youngest female sibling and her mate has parents.

    return (this.father.hasSiblings() && this.father.sibIndex === 0 && this.mother.hasParents()) ||
           (this.father.hasSiblings() && this.mother.sibIndex !== undefined &&
            this.mother.sibIndex === this.mother.parentNest.children().length - 1 &&
            this.father.hasParents());
  }
};

module.exports = Nest;
