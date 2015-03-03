'use strict';


var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');

var Structures = require('../common/Structures');

var schema = require('../../schemas/schema.json');


var Schemas = Structures.Schemas;


var CHANGE_EVENT = 'change';


var SCHEMAS = new Schemas({
  pedigree: Immutable.fromJS(
    schema.definitions.pedigree.properties
  ).delete('members').delete('nests').delete('schemaExtension'),

  member: Immutable.fromJS(
    schema.definitions.member.properties
  ),

  nest: Immutable.fromJS(
    schema.definitions.nest.properties
  ).delete('pregnancies'),

  pregnancy: Immutable.fromJS(
    schema.definitions.pregnancy.properties
  ).delete('zygotes')
});


var AppStore = assign({}, EventEmitter.prototype, {
  getSchemas: function() {
    return SCHEMAS;
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
