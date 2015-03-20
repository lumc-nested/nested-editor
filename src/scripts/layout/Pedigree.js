'use strict';

var Member = require('./Member');
var Nest = require('./Nest');
var Pregnancy = require('./Pregnancy');
var Utils = require('../common/Utils');


var Individual = Member.Individual;

var Pedigree = function(data) {
  this.data = data;
  this.members = {};
  this.nests = [];

  this.init();
};

Pedigree.prototype = {

  init: function() {

    // Create member objects.
    this.members = this.data.members
      .map((member, memberKey) => new Individual(memberKey, member.fields.get('gender')))
      .toJS();

    // Create nest objects.
    this.nests = this.data.nests
      .map((nest, nestKey) => {
        var [father, mother] = Utils.getFatherAndMother(nestKey, this.data.members);

        var pregnancies = nest.pregnancies
          .map(pregnancy => new Pregnancy(
            pregnancy.zygotes.map(zygote => this.members[zygote]).toJS()))
          .toJS();

        return new Nest(
          this.members[father],
          this.members[mother],
          pregnancies,
          nest.get('consanguenous'));
      })
      .toList()
      .toJS();
  }
};

module.exports = Pedigree;
