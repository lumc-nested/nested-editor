var Immutable = require('immutable');

var {Document} = require('../common/Structures');

var parser = require('./ped.pegjs');


var accept = ['ped'];


var parseGender = function(gender) {
  if (gender === 1) {
    return 'male';
  } else if (gender === 2) {
    return 'female';
  }
  return 'unknown';
};


var readParseTree = function(parseTree) {
  var customMemberFieldSchemas;
  var fields;
  var members;
  var originalMembers;
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
              Immutable.Map({
                father: member.get('father'),
                mother: member.get('mother'),
                gender: parseGender(member.get('gender')),
                family: member.get('family')
              })];
    });

  fields = Immutable.Map({title: 'Imported from PED'});

  customMemberFieldSchemas = Immutable.Map({
    family: {
      title: 'Family',
      type: 'string'
    }
  });

  return new Document({members, fields, customMemberFieldSchemas});
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
