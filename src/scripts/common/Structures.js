var Immutable = require('immutable');


var MatingKey = Immutable.Record({
  // Key of the father.
  father: undefined,

  // Key of the mother.
  mother: undefined
});


var Document = Immutable.Record({
  // Map of strings (individual keys) to maps of strings (field keys) to
  // scalars (field values).
  individuals: Immutable.Map(),

  // Map of strings (field keys) to scalars (field values).
  fields: Immutable.Map(),

  // Map of strings (field keys) to Immutable representations of JSON Schemas.
  customIndividualFieldSchemas: Immutable.Map()
});


var ObjectRef = Immutable.Record({
  // Type of the referenced object (one of 'document', 'mating', 'individual').
  // TODO: Probably change this to 'document', 'mating', 'individual'.
  type: 'document',

  // Key of the referenced object.
  key: undefined
});


module.exports = {Document, MatingKey, ObjectRef};
