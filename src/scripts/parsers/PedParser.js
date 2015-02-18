'use strict';

var _ = require('lodash');
var parser = require('./ped.pegjs');

var parse = function(text) {
  var lastId = 0;

  var newId = function() {
    lastId += 1;
    return lastId;
  };

  var document = parser.parse(text);

  var pedMembers = _(document).filter(function(entry) {
    return entry[0] === 'member';
  }).map(function(entry) {
    entry[1].id = newId();
    return entry[1];
  }).value();

  var members = _.map(pedMembers, function(member) {
    return {
      '_id': member.id,
      'externalID': member.member,
      'gender': member.gender
    };
  });

  // While building the nests with their pregnancies, this array holds
  // structures containing all the nest information from which proper
  // instances of Nest will be constructed later.
  // This is a bit of a hack around how Nest objects currently need to
  // have all their pregnancies passed at once.
  var nests = [];

  _.each(pedMembers, function(member) {
    var nest, pregnancy;
    var father = _.find(pedMembers, {'family': member.family,
                                     'member': member.father});
    var mother = _.find(pedMembers, {'family': member.family,
                                     'member': member.mother});

    // Todo: What should we do when exactly one of the parents is defined?
    if (father === undefined || mother === undefined) {
      return;
    }

    nest = _.find(nests, {'father': father.id, 'mother': mother.id});
    pregnancy = {'zygotes': [member.id]};

    if (nest === undefined) {
      nests.push({
        'father': father.id,
        'mother': mother.id,
        'pregnancies': [pregnancy]
      });
    } else {
      nest.pregnancies.push(pregnancy);
    }
  });

  return {'members': members, 'nests': nests};
};

module.exports = {'parse': parse};
