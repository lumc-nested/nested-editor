'use strict';

var _ = require('lodash');
var PC = require('../constants/PedigreeConstants.js');
var Pedigree = require('./Pedigree.js');

var Female = PC.Gender.Female;
var Male = PC.Gender.Male;
var Unknown = PC.Gender.Unknown;

var Engine = function(data) {

  this.pedigree = new Pedigree(data);
  this.leftEdge = 50;
  this.topEdge = 50;
  this.start = {
    x: 50,
    y: 50
  };
};

Engine.prototype = {

  findRoots: function() {
    // TODO: figure out the order of the nests within the first generation.
    return _.filter(this.pedigree.nests, function(nest) {
      return nest.father.parentNest === undefined &&
             nest.mother.parentNest === undefined;
    });
  },

  arrange: function(){

    var roots = this.findRoots();
    _.each(roots, function(nest) {
      this.arrangeNest(nest, 0, 50);
    }, this);
    return this.pedigree;
  },

  arrangeNest: function(nest, generationIndex, center) {

    // first order the children along with their nests.
    var orderedChildrenWithMates = this.getChildrenWithNests(nest);

    // define nest center based on children.
    var childrenWidth = (this.getNestWidth(nest) - 1) * PC.MemberDistance;

    nest.location = {
      x: center,
      y: generationIndex * PC.GenerationDistance
    };

    var currentLeft = nest.location.x - childrenWidth / 2;
    _.each(orderedChildrenWithMates, function(member, index) {
      if (member.location === undefined) {
        // this member has not been arranged from his/her nests.
        currentLeft = this.arrangeMember(member, generationIndex + 1, currentLeft);
      } else {
        currentLeft = member.location.x;
      }
      currentLeft += PC.MemberDistance;
    }, this);


    if (nest.father.location === undefined) {
      nest.father.location = {
        x: nest.location.x - PC.MemberDistance / 2,
        y: nest.location.y
      };
    }

    if (nest.mother.location === undefined) {
      nest.mother.location = {
        x: nest.location.x + PC.MemberDistance / 2,
        y: nest.location.y
      };
    }

    console.log("nest.x: " + nest.location.x + "; y: " + nest.location.y);

    return nest.location.x;
  },

  arrangeMember: function(member, generationIndex, leftEdge) {
    if (member.hasMates()) {
      var currentLeft = leftEdge;
      _.each(member.matingNests, function(nest) {
        currentLeft = this.arrangeNest(nest, generationIndex, currentLeft + PC.MemberDistance / 2);
      }, this);

      return currentLeft;
    } else {
      member.location = {
        x: leftEdge,
        y: generationIndex * PC.GenerationDistance
      };

      console.log(member.location);
      return leftEdge;
    }
  },

  // return grid units
  getNestWidth: function(nest) {
    if (nest.children().length === 0) {
      return 2; // width of the parents
    } else {
      var width = 0;
      _.each(nest.children(), function(child) {
        width += this.getMemberWidth(child);
      }, this);

      //return _.max([2, width]); // at least width of two for the parents.
      return width;
    }
  },

  getMemberWidth: function(member) {
    if (member.hasMates()) {
      var width = 0;
      _.each(member.matingNests, function(nest) {
        width += this.getNestWidth(nest);
      }, this);

      return width;
    }

    // self width
    return 1;
  },

  getChildrenWithNests: function(nest) {
    var orderedChildrenWithMates = [];
    _.each(nest.children(), function(child) {
      if (!child.hasMates()) {
        // simple case
        orderedChildrenWithMates.push(child);
      } else if (child.mates.length === 1) {
        // by default, father should be the left of the mother,
        // except:
        // 1. child is the oldest sibling and his mate has parents.
        // 2. child is the youngest sibling and her mate has parents.
        var mateFirst;
        var mate = child.mates[0];

        var deterministicGender = child.gender() === Unknown ? mate.gender() : child.gender();

        switch (deterministicGender) {
          case Male:
            mateFirst = child.sibIndex === 0 && mate.hasParents();
            break;

          case Female:
            mateFirst = !(child.sibIndex === nest.children().length - 1 &&
                            mate.hasParents());
            break;

          case Unknown:
            mateFirst = true;
        }

        if (mateFirst) {
          orderedChildrenWithMates.push(mate);
          orderedChildrenWithMates.push(child);
        } else {
          orderedChildrenWithMates.push(child);
          orderedChildrenWithMates.push(mate);
        }

      } else {
        console.log("TODO: handle individual with more that one nest.");
      }
    });

    return orderedChildrenWithMates;
  }
};

module.exports = Engine;
