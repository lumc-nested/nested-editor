var Kinetic = require('kinetic');
var _ = require('lodash');
var PC = require('../constants/PedigreeConstants.js');


var Nest = function(nest, members) {
  this.nest = nest;
  Kinetic.Group.call(this, {});

  this.init(members);
};


Nest.prototype = {
  init: function(members) {
    if (members === undefined) {
      // no previous information is known on members, create shapes based on
      // minimum information.
      this.father = new Member({'id': this.nest.father, 'gender': 1});
      this.mother = new Member({'id': this.nest.mother, 'gender': 2});

      this.pregnencies = _.map(this.nest.pregnancies, function(preg) {
        return _.map(preg, function(child) {
          return new Member({'id': child});
        });
      });
    } else {
      // member descriptions are already created. reuse them.
      this.father = _.find(members, {'id': this.nest.father});
      this.mother = _.find(members, {'id': this.nest.mother});

      this.pregnancies = _.map(this.nest.pregnancies, function(preg) {
        return _.map(preg, function(child) {
          return _.find(members, {'id': child});
        });
      });
    }
  },

  doLayout: function() {
    var that = this;

    // clear previously defined shapes.
    this.destroyChildren();


    // layout parents
    var parentLink = new Kinetic.Line({
      points: [0, 0, PC.ParentDistance, 0],
      stroke: PC.ThemeColor,
      position: {x: -PC.ParentDistance / 2 + PC.MemberSize / 2, y: 0}
    });

    this.add(parentLink);

    this.father.setPosition({x: -PC.ParentDistance / 2, y: -PC.MemberSize / 2});
    this.mother.setPosition({x: PC.ParentDistance / 2, y: -PC.MemberSize / 2});
    this.add(this.father, this.mother);


    // link parents with the next generation
    var generationLink = new Kinetic.Line({
      points: [0, 0, 0, PC.GenerationDistance / 2],
      stroke: PC.ThemeColor,
      position: {x: PC.MemberSize / 2, y: 0}
    });
    this.add(generationLink);


    // link siblings.
    var numberOfSiblings = this.pregnancies.length;
    var siblingWidth = PC.SiblingDistance * (numberOfSiblings - 1);

    _.each(this.pregnancies, function(preg, preg_index) {
      _.each(preg, function(child) {
        var x = -siblingWidth / 2 + preg_index * PC.SiblingDistance;

        child.setPosition({x: x, y: PC.GenerationDistance - PC.MemberSize / 2});

        var link = new Kinetic.Line({
          points: [0, 0, x, 0, x, PC.GenerationDistance / 2],
          stroke: PC.ThemeColor
        });
        link.setPosition({x: PC.MemberSize / 2, y: PC.GenerationDistance / 2});

        that.add(link, child);
      });
    });

  }
};
Kinetic.Util.extend(Nest, Kinetic.Group);

module.exports = Nest;
