'use strict';

var _ = require('lodash');

var Member;
var Individual;
var Group;


Member = function(data) {
  this._id = data._id;
  this.siblings = [];
  this.parentNest = undefined;
  this.data = _.omit(data, '_id');
};

Member.prototype = {

  isDead: function() {
    return this.data.dateOfDeath !== undefined ||
           (this.data.deceased !== undefined && this.data.deceased);
  },

  gender: function() {
    return this.data.gender;
  },

  isProband: function() {
    return this.data.proband;
  },

  isConsultand: function() {
    return this.data.consultand;
  },

  hasParents: function() {
    return this.parentNest !== undefined;
  },

  hasSiblings: function() {
    return this.siblings.length > 0;
  }
};


Individual = function(data) {
  Member.call(this, data);
  this.children = [];
  this.matingNests = [];
};

Individual.prototype = _.create(Member.prototype, {
  constructor: Individual,

  addChildren: function(children) {
    // TODO: should this be a flat list?
    this.children.push(children);
  },

  addMatingNest: function(nest) {
    this.matingNests.push(nest);
  },

  hasMates: function() {
    return this.matingNests.length > 0;
  },

  hasChildren: function() {
    return _.flatten(this.children).length > 0;
  }
});


Group = function(data) {
  Member.call(this, data);
};

Group.prototype = _.create(Member.prototype, {
  constructor: Group,

  hasMates: function() {
    // a group cannot have spouse.
    return false;
  },

  hasChildren: function() {
    // a group cannot have children.
    return false;
  }
});


module.exports = {
  'Individual': Individual,
  'Group': Group
};
