var Immutable = require('immutable');
var tv4 = require('tv4');

var {Document} = require('../common/Structures');

var jsonSchema = require('../../schemas/schema.json');


var accept = ['json'];


var readJson = function(json) {
  var customMemberFieldSchemas;
  var fields;
  var members;
  var mergedJsonSchema;

  if (!tv4.validate(json, jsonSchema)) {
    console.log(tv4.error);
    throw new Error('base schema validation failed');
  }

  // Our base schema with any custom member field definitions added.
  // TODO: Check if this does what we hope it does.
  mergedJsonSchema =
    Immutable.fromJS(jsonSchema).setIn(
      ['definitions', 'member', 'properties'],
      Immutable.fromJS(json.customMemberPropertySchemas || {}).merge(
        jsonSchema.definitions.member.properties
      )
    ).toJS();

  if (!tv4.validate(json, mergedJsonSchema)) {
    console.log(tv4.error);
    throw new Error('merged schema validation failed');
  }

  members = Immutable.fromJS(json.members || {});
  fields = Immutable.fromJS(json).delete('members').delete('customMemberPropertySchemas');
  customMemberFieldSchemas = Immutable.fromJS(json.customMemberPropertySchemas || {});

  return new Document({members, fields, customMemberFieldSchemas});
};


var readString = function(string) {
  return readJson(JSON.parse(string));
};


module.exports = {accept, readJson, readString};
