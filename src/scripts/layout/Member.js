'use strict';

var _ = require('lodash');

var Member = function(data) {
  this._id = data._id;
  this.data = _.omit(data, "_id");
};

Member.prototype = {

  isDead: function() {
    return this.data.dateOfDeath !== undefined ||
           (this.data.deceased !== undefined && this.data.deceased);
  },

  gender: function() {
    return this.data.gender;
  },

  hasParents: function() {
    return this.father !== undefined || this.mother !== undefined;
  }
};


var Individual = function(data) {
  Member.call(this, data);
  this.spouses = [];
  this.children = [];
  this.parentNest = undefined;
  this.ownNests = [];
};

Individual.prototype = _.create(Member.prototype, {
  constructor: Individual,

  addSpouse: function(member) {
    this.spouses.push(member);
  },

  addChildren: function(children) {
    // TODO: should this be a flat list?
    this.children.push(children);
  },

  addOwnNest: function(nest) {
    this.ownNests.push(nest);
  },

  hasSpouses: function() {
    return this.spouses.length > 0;
  },

  hasChildren: function() {
    return _.flatten(this.children).length > 0;
  }
});


var Group = function(data) {
  Member.call(this, data);
};

Group.prototype = _.create(Member.prototype, {
  constructor: Group,

  hasSpouses: function() {
    // a group cannot have spouse.
    return false;
  },

  hasChildren: function() {
    // a group cannot have children.
    return false;
  }
});


module.exports = {
  "Individual": Individual,
  "Group": Group
};
