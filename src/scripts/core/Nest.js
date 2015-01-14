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

};

module.exports = Nest;
