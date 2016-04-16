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

  addPartner: function(individualKey) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_PARTNER,
      individualKey
    });
  },

  addChild: function(fatherKey, motherKey, gender) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_CHILD,
      fatherKey,
      motherKey,
      gender
    });
  },

  addParents: function(individualKey) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_PARENTS,
      individualKey
    });
  },

  addTwin: function(individualKey) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_TWIN,
      individualKey
    });
  },

  deleteIndividual: function(individualKey) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.DELETE_INDIVIDUAL,
      individualKey
    });
  },

  updateIndividualFields: function(individualKey, fields) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.UPDATE_INDIVIDUAL_FIELDS,
      individualKey,
      fields
    });
  },

  addCustomIndividualField: function(field, schema) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_CUSTOM_INDIVIDUAL_FIELD,
      field,
      schema
    });
  },

  deleteCustomIndividualField: function(field) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.DELETE_CUSTOM_INDIVIDUAL_FIELD,
      field
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
