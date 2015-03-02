'use strict';


var Immutable = require('immutable');
var tv4 = require('tv4');

var Structures = require('../common/Structures');

var metaSchema = require('../../json-schema-draft04.json');
var schema = require('../../schema.json');


var Pregnancy = Structures.Pregnancy;
var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;


var parse = function(text) {
  var members;
  var nests;
  var parsedJson;
  var pedigree;
  var props;
  var schemaExtension;

  parsedJson = JSON.parse(text);

  if (!tv4.validate(parsedJson, schema)) {
    throw new Error('base schema validation failed');
    console.log(tv4.error);
  }

  schemaExtension = Immutable.fromJS(parsedJson.schemaExtension || {});

  if (!tv4.validate(parsedJson, schemaExtension.mergeDeep(schema).toJS())) {
    throw new Error('merged schema validation failed');
    console.log(tv4.error);
  }

  members = Immutable.fromJS(parsedJson.pedigree.members);

  nests = Immutable.Map(parsedJson.pedigree.nests).mapEntries(([nestKey, nest]) => {
    var props;
    var pregnancies;

    // In JSON, the nest keys are the parent keys joined by comma's. For now
    // we only support two parents.
    nestKey = Immutable.Set(nestKey.split(','));
    console.assert(nestKey.size === 2,
                   `No support for nests with ${nestKey.size} parents`);

    pregnancies = Immutable.List(nest.pregnancies).map(
      pregnancy => new Pregnancy({
        zygotes: Immutable.List(pregnancy.zygotes),
        props: Immutable.Map(pregnancy).delete('zygotes')
      })
    );
    props = Immutable.Map(nest).delete('pregnancies');

    return [nestKey, new Nest({pregnancies, props})];
  });

  props = Immutable.Map(parsedJson.pedigree)
    .delete('members')
    .delete('nests');

  pedigree = new Pedigree({members, nests, props});

  console.log('schema extension', schemaExtension.toString());

  return {pedigree, schemaExtension};
};


tv4.addSchema('http://json-schema.org/draft-04/schema#', metaSchema);


module.exports = {parse};
