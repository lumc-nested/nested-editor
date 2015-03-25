'use strict';


var Immutable = require('immutable');


var Member = Immutable.Record({
  // Set of strings (member keys).
  parents: Immutable.Set(),

  // Map of strings (field keys) to scalars (field values).
  fields: Immutable.Map()
});


var Pregnancy = Immutable.Record({
  // List of strings (member keys, in chronological order of delivery).
  children: Immutable.List(),

  // List of integers (per item in `children`, a corresponding zygote number).
  // The default value of `undefined` represents unknown zygosity.
  zygotes: undefined,

  // Map of strings (field keys) to scalars (field values).
  fields: Immutable.Map()
});


var Nest = Immutable.Record({
  // List of Pregnancy instances, in chronological order.
  pregnancies: Immutable.List(),

  // Map of strings (field keys) to scalars (field values).
  fields: Immutable.Map()
});


var Pedigree = Immutable.Record({
  // Map of strings (member keys) to Member instances.
  members: Immutable.Map(),

  // Map of Sets to Nest instances where the Sets contain a string (member
  // key) for each parent.
  nests: Immutable.Map(),

  // Map of strings (field keys) to scalars (field values).
  fields: Immutable.Map()
});


var Schema = Immutable.Record({
  // Field definitions are maps of strings (field keys) to Immutable
  // representations of JSON Schemas.
  pedigree: Immutable.Map(),
  member: Immutable.Map(),
  nest: Immutable.Map(),
  pregnancy: Immutable.Map()
});


var Document = Immutable.Record({
  // Pedigree instance.
  pedigree: new Pedigree(),

  // Custom field definitions.
  schema: new Schema()
});


module.exports = {Member, Pregnancy, Nest, Pedigree, Document, Schema};
