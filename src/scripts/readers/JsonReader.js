'use strict';


var Immutable = require('immutable');
var tv4 = require('tv4');

var Structures = require('../common/Structures');
var Utils = require('./Utils');

var jsonMetaSchema = require('../../schemas/json-schema-draft04.json');
var jsonSchema = require('../../schemas/schema.json');


var Document = Structures.Document;
var Member = Structures.Member;
var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;
var Pregnancy = Structures.Pregnancy;
var Schema = Structures.Schema;


var accept = ['json'];


var readJson = function(json) {
  var members;
  var nests;
  var pedigree;
  var fields;
  var schema;
  var schemaExtension;

  if (!tv4.validate(json, jsonSchema)) {
    console.log(tv4.error);
    throw new Error('base schema validation failed');
  }

  schemaExtension = Immutable.fromJS(json.schemaExtension || {});

  if (!tv4.validate(json, schemaExtension.mergeDeep(jsonSchema).toJS())) {
    console.log(tv4.error);
    throw new Error('merged schema validation failed');
  }

  members = Immutable.fromJS(json.pedigree.members).map(fields => new Member({fields}));

  nests = Immutable.Map(json.pedigree.nests).mapEntries(([nestKey, nest]) => {
    var fields;
    var pregnancies;

    // In JSON, the nest keys are the parent keys joined by comma's. For now
    // we only support two parents.
    nestKey = Immutable.Set(nestKey.split(','));
    console.assert(nestKey.size === 2,
                   `No support for nests with ${nestKey.size} parents`);

    pregnancies = Immutable.List(nest.pregnancies).map(
      pregnancy => new Pregnancy({
        zygotes: Immutable.List(pregnancy.zygotes),
        fields: Immutable.Map(pregnancy).delete('zygotes')
      })
    );
    fields = Immutable.Map(nest).delete('pregnancies');

    return [nestKey, new Nest({pregnancies, fields})];
  });

  fields = Immutable.Map(json.pedigree)
    .delete('members')
    .delete('nests');

  // Add parents key to member instances.
  members = Utils.populateParents(members, nests);

  pedigree = new Pedigree({members, nests, fields});

  schema = new Schema({
    pedigree: schemaExtension.getIn(['definitions', 'pedigree', 'properties']) || Immutable.Map(),
    member: schemaExtension.getIn(['definitions', 'member', 'properties']) || Immutable.Map(),
    nest: schemaExtension.getIn(['definitions', 'nest', 'properties']) || Immutable.Map(),
    pregnancy: schemaExtension.getIn(['definitions', 'pregnancy', 'properties']) || Immutable.Map()
  });

  return new Document({pedigree, schema});
};


var readString = function(string) {
  return readJson(JSON.parse(string));
};


tv4.addSchema('http://json-schema.org/draft-04/schema#', jsonMetaSchema);


module.exports = {accept, readJson, readString};
