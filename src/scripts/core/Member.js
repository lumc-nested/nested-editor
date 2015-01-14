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
};

Individual.prototype = _.extend(Member.prototype, {});


var Group = function(config) {
  Member.call(this, config);
};

Group.prototype = _.extend(Member.prototype, {});


module.exports = {
  "Individual": Individual,
  "Group": Group
};
