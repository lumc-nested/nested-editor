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
  }
};


var Individual = function(data) {
  Member.call(this, data);
  this.spouses = [];
  this.children = [];
};

Individual.prototype = _.extend(Member.prototype, {
  addSpouse: function(member) {
    this.spouses.push(member);
  },

  addChildren: function(children) {
    // TODO: should this be a flat list?
    this.children.push(children);
  },

  hasSpouse: function() {
    return this.spouses.length > 0;
  },

  hasChildren: function() {
    return _.flatten(this.children).length > 0;
  }
});


var Group = function(data) {
  Member.call(this, data);
};

Group.prototype = _.extend(Member.prototype, {});


module.exports = {
  "Individual": Individual,
  "Group": Group
};
