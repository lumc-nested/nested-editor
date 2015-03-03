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


var Schemas = Immutable.Record({
  // Schemas for fields. For now just a map of strings (field keys) to
  // Immutable representations of JSON Schemas.
  pedigree: Immutable.Map(),
  member: Immutable.Map(),
  nest: Immutable.Map(),
  pregnancy: Immutable.Map()
});


var Document = Immutable.Record({
  // Pedigree instance.
  pedigree: new Pedigree(),

  // Schemas for custom fields.
  schemas: new Schemas()
});


module.exports = {Pregnancy, Nest, Pedigree, Document, Schemas};
