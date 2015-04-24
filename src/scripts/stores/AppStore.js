'use strict';


var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');

var Structures = require('../common/Structures');

var jsonSchema = require('../../schemas/schema.json');


var Schema = Structures.Schema;


var CHANGE_EVENT = 'change';


var SCHEMA = new Schema({
  pedigree: Immutable.fromJS(
    jsonSchema.definitions.pedigree.properties
  ).delete('members').delete('nests').delete('schemaExtension').delete('symbol'),

  member: Immutable.fromJS(
    jsonSchema.definitions.member.properties
  ),

  nest: Immutable.fromJS(
    jsonSchema.definitions.nest.properties
  ).delete('pregnancies'),

  pregnancy: Immutable.fromJS(
    jsonSchema.definitions.pregnancy.properties
  ).delete('children').delete('zygotes')
});


var AppStore = assign({}, EventEmitter.prototype, {
  getSchema: function() {
    return SCHEMA;
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
