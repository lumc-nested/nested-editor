'use strict';


var Immutable = require('immutable');

var Structures = require('../common/Structures');

var parser = require('./ped.pegjs');


var Pregnancy = Structures.Pregnancy;
var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;


var parse = function(text) {
  var members;
  var mergeNests;
  var nests;
  var originalMembers;
  var singletonNest;
  var singletonNestMap;
  var uniqueKeys;

  // List of member Maps with the fields we got from the PEG.js parser.
  originalMembers = Immutable.fromJS(parser.parse(text))
    .filter(([type, _]) => type === 'member')
    .map(([_, member]) => member);

  // Are the member keys unique?
  uniqueKeys = originalMembers.map(m => m.get('member')).toSet().size === originalMembers.size;

  if (!uniqueKeys) {
    // Add the family key to the member key to make them unique.
    originalMembers = originalMembers.map(member => {
      var withFamily = field => {
        var value = member.get(field);
        return (value === undefined) ? undefined : (member.get('family') + '.' + value);
      };
      return member.merge({
        member: withFamily('member'),
        father: withFamily('father'),
        mother: withFamily('mother')
      });
    });
  }

  // Map of strings (member keys) to Maps (member fields).
  members = originalMembers
    .toMap()
    .mapEntries(([_, member]) => {
      return [member.get('member'),
              Immutable.Map({
                gender: member.get('gender'),
                // TODO: Schema definition for family.
                family: member.get('family')
              })];
    });

  // Nest of one child with given key.
  singletonNest = key => {
    var pregnancy = new Pregnancy({zygotes: Immutable.List.of(key)});
    return new Nest({pregnancies: Immutable.List.of(pregnancy)});
  };

  // Map of one singleton nest for the given member, indexed by the parent keys.
  singletonNestMap = member => Immutable.Map([
    [Immutable.Set.of(member.get('father'), member.get('mother')),
     singletonNest(member.get('member'))]
  ]);

  // Combine pregnancies from two nests.
  mergeNests = (nestA, nestB) => new Nest({
    pregnancies: nestA.pregnancies.concat(nestB.pregnancies)
  });

  // Create a singleton nest for each member that we know both parents of,
  // index these nests by their parents and merge any duplicates.
  nests = originalMembers
    .filter(member => members.has(member.get('father')) && members.has(member.get('mother')))
    .toMap()
    .reduce((nests, member) => nests.mergeWith(mergeNests, singletonNestMap(member)),
            Immutable.Map());

  return new Pedigree({members, nests});
};


module.exports = {parse};
