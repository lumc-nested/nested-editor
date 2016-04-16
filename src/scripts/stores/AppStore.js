var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');

var jsonSchema = require('../../schemas/schema.json');


var CHANGE_EVENT = 'change';


var DOCUMENT_FIELD_SCHEMAS = Immutable.fromJS(
  jsonSchema.properties
).delete('individuals').delete('customIndividualPropertySchemas');


var INDIVIDUAL_FIELD_SCHEMAS = Immutable.fromJS(
  jsonSchema.definitions.individual.properties
).delete('father').delete('mother').delete('monozygote').delete('dizygote');


var AppStore = assign({}, EventEmitter.prototype, {
  getDocumentFieldSchemas: function() {
    return DOCUMENT_FIELD_SCHEMAS;
  },

  getIndividualFieldSchemas: function() {
    return INDIVIDUAL_FIELD_SCHEMAS;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});


module.exports = AppStore;
