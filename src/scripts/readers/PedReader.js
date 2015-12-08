var Immutable = require('immutable');

var Structures = require('../common/Structures');
var Utils = require('./Utils');

var parser = require('./ped.pegjs');


var Document = Structures.Document;
var Member = Structures.Member;
var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;
var Pregnancy = Structures.Pregnancy;
var Schema = Structures.Schema;


var accept = ['ped'];


var readParseTree = function(parseTree) {
  var members;
  var mergeNests;
  var nests;
  var originalMembers;
  var pedigree;
  var schema;
  var singletonNest;
  var singletonNestMap;
  var uniqueKeys;

  /* eslint-disable comma-dangle, array-bracket-spacing */

  // List of member Maps with the fields we got from the PEG.js parser.
  originalMembers = Immutable.fromJS(parseTree)
    .filter(([type, ]) => type === 'member')
    .map(([, member]) => member);

  /* eslint-ensable comma-dangle, array-bracket-spacing */

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
    .mapEntries(([, member]) => {
      return [member.get('member'),
              new Member({fields: Immutable.Map({
                gender: member.get('gender'),
                family: member.get('family')
              })})];
    });

  // Nest of one child with given key.
  singletonNest = key => {
    var pregnancy = new Pregnancy({children: Immutable.List.of(key)});
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
    .reduce((oldNests, member) => oldNests.mergeWith(mergeNests, singletonNestMap(member)),
            Immutable.Map());

  // Add parents key to member instances.
  members = Utils.populateParents(members, nests);

  pedigree = new Pedigree({members, nests});

  schema = new Schema({
    member: Immutable.fromJS({
      family: {
        title: 'Family',
        type: 'string'
      }
    })
  });

  return new Document({pedigree, schema});
};


var readString = function(string) {
  var parseTree;

  try {
    parseTree = parser.parse(string);
  } catch (e) {
    console.log(`Line ${e.line}, column ${e.column}: ${e.message}`);
    throw new Error('error parsing ped file');
  }

  return readParseTree(parseTree);
};


module.exports = {accept, readParseTree, readString};
