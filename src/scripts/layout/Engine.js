'use strict';

var _ = require('lodash');
var AppConfig = require('../constants/AppConfig');
var Pedigree = require('./Pedigree');
var GenerationEngine = require('./GenerationEngine');


var Engine = function(data) {
  this.pedigree = new Pedigree(data);
};

Engine.prototype = {

  arrange: function() {
    var ge = new GenerationEngine(this.pedigree);
    var generations = ge.determineGenerations();
    var left = 0;
    _.each(generations[0], function(rootMember) {
      if (rootMember.left !== undefined && rootMember.left.location.x >= left) {
        left = rootMember.left.location.x + AppConfig.MemberDistance;
      }

      _.each(rootMember.matingNests, function(nest) {
        if (nest.location === undefined) {
          left += this.arrangeNest(nest, 0, left) + AppConfig.MemberDistance;
        }
      }, this);
    }, this);

    return this.pedigree;
  },

  arrangeNest: function(nest, generationIndex, center) {
    var children = nest.children();
    var numberOfSiblings = children.length;

    var left;
    var orderedChildrenWithMates;
    var nestWidth;
    var childrenWidth;
    var flip;

    nest.location = {
      x: center,
      y: generationIndex * AppConfig.GenerationDistance
    };

    if (numberOfSiblings > 0) {
      // first order the children along with their nests.
      orderedChildrenWithMates = this.getChildrenWithNests(nest);

      nestWidth = (this.getNestWidth(nest) - 1) * AppConfig.MemberDistance;

      left = nest.location.x - nestWidth / 2;
      _.each(orderedChildrenWithMates, function(member) {
        if (member.location === undefined) {
          // this member has not been arranged from his/her nests.
          left = this.arrangeMember(member, generationIndex + 1, left);
        } else {
          left = member.location.x;
        }
        left += AppConfig.MemberDistance;
      }, this);

      // recenter parents based on children's width
      // (ie., excluding children's mates on the edges.)
      childrenWidth = children[numberOfSiblings - 1].location.x - children[0].location.x;

      nest.location.x = children[0].location.x + childrenWidth / 2;
    }

    flip = nest.shouldFlip();

    if (nest.father.location === undefined) {
      nest.father.location = {
        x: flip ? nest.location.x + AppConfig.MemberDistance / 2 : nest.location.x - AppConfig.MemberDistance / 2,
        y: nest.location.y
      };
    }

    if (nest.mother.location === undefined) {
      nest.mother.location = {
        x: flip ? nest.location.x - AppConfig.MemberDistance / 2 : nest.location.x + AppConfig.MemberDistance / 2,
        y: nest.location.y
      };
    }

    return _.max(nest.location.x, left);
  },

  arrangeMember: function(member, generationIndex, leftEdge) {
    var currentLeft;

    // simple collision detection.
    // TODO: this assumes that the order defined by GenerationEngine is correct.
    if (member.left !== undefined &&
        member.left.location !== undefined &&
        member.left.location.x > leftEdge - AppConfig.MemberDistance) {
      leftEdge = member.left.location.x + AppConfig.MemberDistance;
    }

    if (member.hasMates()) {
      currentLeft = leftEdge;
      _.each(member.matingNests, function(nest) {
        currentLeft = this.arrangeNest(nest, generationIndex, currentLeft + AppConfig.MemberDistance / 2);
      }, this);

      return currentLeft;
    } else {
      member.location = {
        x: leftEdge,
        y: generationIndex * AppConfig.GenerationDistance
      };

      console.log(member.location);
      return leftEdge;
    }
  },

  // return grid units
  getNestWidth: function(nest) {
    var width;

    if (nest.children().length === 0) {
      return 2; // width of the parents
    } else {
      width = 0;
      _.each(nest.children(), function(child) {
        width += this.getMemberWidth(child);
      }, this);

      // return _.max([2, width]); // at least width of two for the parents.
      return width;
    }
  },

  getMemberWidth: function(member) {
    var width;

    if (member.hasMates()) {
      width = 0;
      _.each(member.matingNests, function(nest) {
        width += this.getNestWidth(nest);
      }, this);

      return width;
    }

    // self width
    return 1;
  },

  getChildrenWithNests: function(nest) {
    var matingNest;
    var orderedChildrenWithMates = [];

    _.each(nest.children(), function(child) {
      if (!child.hasMates()) {
        // simple case
        orderedChildrenWithMates.push(child);
      } else if (child.matingNests.length === 1) {
        matingNest = child.matingNests[0];

        if (matingNest.shouldFlip()) {
          orderedChildrenWithMates.push(matingNest.mother);
          orderedChildrenWithMates.push(matingNest.father);
        } else {
          orderedChildrenWithMates.push(matingNest.father);
          orderedChildrenWithMates.push(matingNest.mother);
        }

      } else {
        console.log('TODO: handle individual with more that one nest.');
      }
    });

    return orderedChildrenWithMates;
  }
};

module.exports = Engine;
