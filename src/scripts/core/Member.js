'use strict';

var _ = require('lodash');

var Member = function(config) {
  _.extend(this, config);
};

Member.prototype = {

  isDead: function() {
    return this.dateOfDeath !== undefined ||
           (this.deceased !== undefined && this.deceased);
  }
};


var Individual = function(config) {
  Member.call(this, config);
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


var Group = function(config) {
  Member.call(this, config);
};

Group.prototype = _.extend(Member.prototype, {});


module.exports = {
  "Individual": Individual,
  "Group": Group
};
