'use strict';

var _ = require('lodash');
var Immutable = require('immutable');
var Member = require('./Member');
var Nest = require('./Nest');
var Pregnancy = require('./Pregnancy');

var Individual = Member.Individual;
var Group = Member.Group;


var convertImmutablePedigreeToOldJS = function(pedigree) {
  var members;
  var nests;

  members = pedigree.members
    .map((member, memberKey) =>  member.set('_id', memberKey))
    .toList()
    .toJS();

  nests = pedigree.nests
    .map((nest, nestKey) => Immutable.Map({
      father: nestKey.first(),
      mother: nestKey.last(),
      pregnancies: nest.pregnancies
    }))
    .toList()
    .toJS();

  return {members, nests};
};


var Pedigree = function(data) {
  // TODO: We hope the conversion from the immutable pedigree structure to
  //   the old plain javascript object structure is temporary.
  this.data = convertImmutablePedigreeToOldJS(data);
  this.members = {};
  this.nests = [];
  this.id = data.id || 1;

  this.init();
};

Pedigree.prototype = {

  init: function() {
    var nests;

    var data = this.data;

    var members = {};

    // Create member objects.
    _.each(data.members, function(memberProps) {
      if (_.has(memberProps, 'numberOfIndividuals')) {
        members[memberProps._id] = new Group(memberProps);
      } else {
        members[memberProps._id] = new Individual(memberProps);
      }
    });

    this.members = members;

    // Create nest objects.
    nests = _.map(data.nests, function(nestProps) {
      var father = members[nestProps.father];
      var mother = members[nestProps.mother];

      var pregnancies = _.map(nestProps.pregnancies, function(pregProps) {
        var zygotes = _.map(pregProps.zygotes, function(zygote) {
          var child = members[zygote];
          return child;
        });

        return new Pregnancy(zygotes);
      });

      // Create a nest.
      return new Nest(father, mother, pregnancies, nestProps.consanguenous);
    });

    this.nests = nests;
  }
};

module.exports = Pedigree;
