var Immutable = require('immutable');


var NestKey = Immutable.Record({
  // Key of the father.
  father: undefined,

  // Key of the mother.
  mother: undefined
});


var Document = Immutable.Record({
  // Map of strings (member keys) to maps of strings (field keys) to scalars
  // (field values).
  members: Immutable.Map(),

  // Map of strings (field keys) to scalars (field values).
  fields: Immutable.Map(),

  // Map of strings (field keys) to Immutable representations of JSON Schemas.
  customMemberFieldSchemas: Immutable.Map()
});


var ObjectRef = Immutable.Record({
  // Type of the referenced object (one of 'pedigree', 'nest', 'member').
  // TODO: Probably change this to 'document', 'mating', 'individual'.
  type: 'pedigree',

  // Key of the referenced object.
  key: undefined
});


module.exports = {Document, NestKey, ObjectRef};
