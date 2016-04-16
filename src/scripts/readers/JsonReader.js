var Immutable = require('immutable');
var tv4 = require('tv4');

var {Document} = require('../common/Structures');

var jsonSchema = require('../../schemas/schema.json');


var accept = ['json'];


var readJson = function(json) {
  var customIndividualFieldSchemas;
  var fields;
  var individuals;
  var mergedJsonSchema;

  if (!tv4.validate(json, jsonSchema)) {
    console.log(tv4.error);
    throw new Error('base schema validation failed');
  }

  // Our base schema with any custom individual field definitions added.
  // TODO: Check if this does what we hope it does.
  mergedJsonSchema =
    Immutable.fromJS(jsonSchema).setIn(
      ['definitions', 'individual', 'properties'],
      Immutable.fromJS(json.customIndividualPropertySchemas || {}).merge(
        jsonSchema.definitions.individual.properties
      )
    ).toJS();

  if (!tv4.validate(json, mergedJsonSchema)) {
    console.log(tv4.error);
    throw new Error('merged schema validation failed');
  }

  individuals = Immutable.fromJS(json.individuals || {});
  fields = Immutable.fromJS(json).delete('individuals').delete('customIndividualPropertySchemas');
  customIndividualFieldSchemas = Immutable.fromJS(json.customIndividualPropertySchemas || {});

  return new Document({individuals, fields, customIndividualFieldSchemas});
};


var readString = function(string) {
  return readJson(JSON.parse(string));
};


module.exports = {accept, readJson, readString};
