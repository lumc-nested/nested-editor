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
  var customIndividualFieldSchemas;
  var fields;
  var individuals;
  var originalIndividuals;
  var uniqueKeys;

  /* eslint-disable comma-dangle, array-bracket-spacing */

  // List of individual Maps with the fields we got from the PEG.js parser.
  originalIndividuals = Immutable.fromJS(parseTree)
    .filter(([type, ]) => type === 'individual')
    .map(([, individual]) => individual);

  /* eslint-ensable comma-dangle, array-bracket-spacing */

  // Are the individual keys unique?
  uniqueKeys = originalIndividuals.map(m => m.get('individual')).toSet().size === originalIndividuals.size;

  if (!uniqueKeys) {
    // Add the family key to the individual key to make them unique.
    originalIndividuals = originalIndividuals.map(individual => {
      var withFamily = field => {
        var value = individual.get(field);
        return (value === undefined) ? undefined : (individual.get('family') + '.' + value);
      };
      return individual.merge({
        individual: withFamily('individual'),
        father: withFamily('father'),
        mother: withFamily('mother')
      });
    });
  }

  // Map of strings (individual keys) to Maps (individual fields).
  individuals = originalIndividuals
    .toMap()
    .mapEntries(([, individual]) => {
      return [individual.get('individual'),
              Immutable.Map({
                father: individual.get('father'),
                mother: individual.get('mother'),
                gender: parseGender(individual.get('gender')),
                family: individual.get('family')
              })];
    });

  fields = Immutable.Map({title: 'Imported from PED'});

  customIndividualFieldSchemas = Immutable.Map({
    family: {
      title: 'Family',
      type: 'string'
    }
  });

  return new Document({individuals, fields, customIndividualFieldSchemas});
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
