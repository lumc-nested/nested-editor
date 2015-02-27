'use strict';


var Immutable = require('immutable');

var Structures = require('../common/Structures');


var Pregnancy = Structures.Pregnancy;
var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;


var parse = function(text) {
  var props;
  var members;
  var nests;
  var parsedJson;

  // TODO: Validate using JSON Schema.

  parsedJson = JSON.parse(text);

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
    .delete('nests')
    .set('schemaExtension', parsedJson.schemaExtension);

  return new Pedigree({members, nests, props});
};


module.exports = {parse};
