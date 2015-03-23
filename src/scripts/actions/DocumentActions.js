'use strict';


var ActionTypes = require('../constants/ActionTypes');
var AppDispatcher = require('../dispatchers/AppDispatcher');


var DocumentActions = {
  setFocus: function(level, key) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.SET_FOCUS,
      level,
      key
    });
  },

  openDocument: function(document) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.OPEN_DOCUMENT,
      document
    });
  },

  addSpouse: function(memberKey) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.ADD_SPOUSE,
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

  updateMember: function(memberKey, fields) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.UPDATE_MEMBER,
      memberKey,
      fields
    });
  },

  updateNest: function(nestKey, fields) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.UPDATE_NEST,
      nestKey,
      fields
    });
  },

  updatePedigree: function(fields) {
    AppDispatcher.dispatch({
      actionType: ActionTypes.UPDATE_PEDIGREE,
      fields
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
