var ActionTypes = require('../constants/ActionTypes');
var AppDispatcher = require('../dispatchers/AppDispatcher');


var DocumentActions = {
  setFocus: function(objectRef) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.SET_FOCUS,
      objectRef
    });
  },

  openDocument: function(document) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.OPEN_DOCUMENT,
      document
    });
  },

  addPartner: function(memberKey) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_PARTNER,
      memberKey
    });
  },

  addChild: function(nestKey, gender) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_CHILD,
      nestKey,
      gender
    });
  },

  addParents: function(memberKey) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_PARENTS,
      memberKey
    });
  },

  addTwin: function(memberKey) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_TWIN,
      memberKey
    });
  },

  deleteMember: function(memberKey) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.DELETE_MEMBER,
      memberKey
    });
  },

  updateFields: function(objectRef, fields) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.UPDATE_FIELDS,
      objectRef,
      fields
    });
  },

  addField: function(objectType, field, schema) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_FIELD,
      objectType,
      field,
      schema
    });
  },

  deleteField: function(objectType, field) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.DELETE_FIELD,
      objectType,
      field
    });
  },

  setSymbol: function(symbol) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.SET_SYMBOL,
      symbol
    });
  },

  undo: function() {
    AppDispatcher.dispatch({
      actionType: ActionTypes.UNDO
    });
  },

  redo: function() {
    AppDispatcher.dispatch({
      actionType: ActionTypes.REDO
    });
  }
};


module.exports = DocumentActions;
