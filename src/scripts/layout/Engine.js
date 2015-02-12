'use strict';

var _ = require('lodash');
var PC = require('../constants/PedigreeConstants.js');
var Pedigree = require('./Pedigree.js');
var GenerationEngine = require('./GenerationEngine.js');

var Female = PC.Gender.Female;
var Male = PC.Gender.Male;
var Unknown = PC.Gender.Unknown;

var Engine = function(data) {
  this.pedigree = new Pedigree(data);
};

Engine.prototype = {

  arrange: function(){
    var ge = new GenerationEngine(this.pedigree);
    var generations = ge.determineGenerations();
    var left = 0;
    _.each(generations[0], function(rootMember) {
      if (rootMember.left !== undefined && rootMember.left.location.x >= left) {
        left = rootMember.left.location.x + PC.MemberDistance;
      }

      _.each(rootMember.matingNests, function(nest) {
        if (nest.location === undefined) {
          left += this.arrangeNest(nest, 0, left) + PC.MemberDistance;
        }
      }, this);
    }, this);

    return this.pedigree;
  },

  arrangeNest: function(nest, generationIndex, center) {

    nest.location = {
      x: center,
      y: generationIndex * PC.GenerationDistance
    };

    var children = nest.children();
    var numberOfSiblings = children.length;

    var left;

    if (numberOfSiblings > 0) {
      // first order the children along with their nests.
      var orderedChildrenWithMates = this.getChildrenWithNests(nest);

      var nestWidth = (this.getNestWidth(nest) - 1) * PC.MemberDistance;

      left = nest.location.x - nestWidth / 2;
      _.each(orderedChildrenWithMates, function(member, index) {
        if (member.location === undefined) {
          // this member has not been arranged from his/her nests.
          left = this.arrangeMember(member, generationIndex + 1, left);
        } else {
          left = member.location.x;
        }
        left += PC.MemberDistance;
      }, this);

      // recenter parents based on children's width
      // (ie., excluding children's mates on the edges.)
      var childrenWidth = children[numberOfSiblings - 1].location.x - children[0].location.x;

      nest.location.x = children[0].location.x + childrenWidth / 2;
    }

    var flip = nest.shouldFlip();
    if (nest.father.location === undefined) {
      nest.father.location = {
        x: flip ? nest.location.x + PC.MemberDistance / 2 : nest.location.x - PC.MemberDistance / 2,
        y: nest.location.y
      };
    }

    if (nest.mother.location === undefined) {
      nest.mother.location = {
        x: flip ? nest.location.x - PC.MemberDistance / 2 : nest.location.x + PC.MemberDistance / 2,
        y: nest.location.y
      };
    }

    return _.max(nest.location.x, left);
  },

  arrangeMember: function(member, generationIndex, leftEdge) {
    // simple collision detection.
    // TODO: this assumes that the order defined by GenerationEngine is correct.
    if (member.left !== undefined &&
        member.left.location !== undefined &&
        member.left.location.x > leftEdge - PC.MemberDistance) {
      leftEdge = member.left.location.x + PC.MemberDistance;
    }

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
      } else if (child.matingNests.length === 1) {
        var matingNest = child.matingNests[0];

        if (matingNest.shouldFlip()) {
          orderedChildrenWithMates.push(matingNest.mother);
          orderedChildrenWithMates.push(matingNest.father);
        } else {
          orderedChildrenWithMates.push(matingNest.father);
          orderedChildrenWithMates.push(matingNest.mother);
        }

      } else {
        console.log("TODO: handle individual with more that one nest.");
      }
    });

    return orderedChildrenWithMates;
  }
};

module.exports = Engine;
