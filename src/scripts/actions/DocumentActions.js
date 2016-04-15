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

  addChild: function(fatherKey, motherKey, gender) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_CHILD,
      fatherKey,
      motherKey,
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

  updateMemberFields: function(memberKey, fields) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.UPDATE_MEMBER_FIELDS,
      memberKey,
      fields
    });
  },

  addCustomMemberField: function(field, schema) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_CUSTOM_MEMBER_FIELD,
      field,
      schema
    });
  },

  deleteCustomMemberField: function(field) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.DELETE_CUSTOM_MEMBER_FIELD,
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
