'use strict';


var Immutable = require('immutable');


var Pregnancy = Immutable.Record({
  // List of strings (member keys).
  zygotes: Immutable.List(),

  // Map of strings (field keys) to scalars (field values).
  fields: Immutable.Map()
});


var Nest = Immutable.Record({
  // List of Pregnancy instances.
  pregnancies: Immutable.List(),

  // Map of strings (field keys) to scalars (field values).
  fields: Immutable.Map()
});


var Pedigree = Immutable.Record({
  // Map of strings (member keys) to Maps (member fields).
  members: Immutable.Map(),

  // Map of Sets to Nest instances where the Sets contain a string (member
  // key) for each parent.
  nests: Immutable.Map(),

  // Map of strings (field keys) to scalars (field values).
  fields: Immutable.Map()
});


var Document = Immutable.Record({
  // Pedigree instance.
  pedigree: new Pedigree(),

  // JSON Schema defining any custom fields used in this pedigree.
  schemaExtension: Immutable.Map()
});


module.exports = {Pregnancy, Nest, Pedigree, Document};
