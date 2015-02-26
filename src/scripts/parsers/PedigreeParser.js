'use strict';


var Immutable = require('immutable');

var Structures = require('../common/Structures');


var Pregnancy = Structures.Pregnancy;
var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;


var parse = function(text) {
  var members;
  var nests;
  var parsedJson;
  var pregnancies;

  parsedJson = JSON.parse(text);
  members = Immutable.fromJS(parsedJson.members);
  nests = Immutable.Map(parsedJson.nests).mapEntries(([nestKey, nest]) => {
    // In JSON, the nest keys are the parent keys joined by comma's. For now
    // we only support two parents.
    nestKey = Immutable.Set(nestKey.split(','));
    console.assert(nestKey.size === 2,
                   `No support for nests with ${nestKey.size} parents`);

    pregnancies = Immutable.List(nest.pregnancies).map(
      pregnancy => new Pregnancy({
        zygotes: Immutable.List(pregnancy.zygotes)
      })
    );

    return [nestKey, new Nest({pregnancies})];
  });

  return new Pedigree({members, nests});
};


module.exports = {parse};
