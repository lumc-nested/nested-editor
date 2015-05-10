var Immutable = require('immutable');

var AppConstants = require('../constants/AppConstants');


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


var Symbol = Immutable.Record({
  // scheme, valid betwen 0 - 7
  // 0. _____
  //    |   |
  //    |___|
  //
  // 1. _____   2. _____
  //    | | |      |___|
  //    |_|_|      |___|
  //
  // 3. _____   4. _____   5. _____  6. _____
  //    | |_|      |_| |      |___|     |_|_|
  //    |_|_|      |_|_|      |_|_|     |___|
  //
  // 7. _____
  //    |_|_|
  //    |_|_|
  scheme: undefined,

  // List of strings representing color
  color: Immutable.List(),

  // List of strings (field keys)
  mapping: Immutable.List(),

  // List of strings representing patterns
  pattern: Immutable.List()
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
  schema: new Schema(),

  // Symbol definition.
  symbol: new Symbol()
});


var ObjectRef = Immutable.Record({
  // Type of the referenced object.
  type: AppConstants.ObjectType.Pedigree,

  // Key of the referenced object.
  key: undefined
});


module.exports = {Member, Pregnancy, Nest, Pedigree, Document, Schema, Symbol, ObjectRef};
