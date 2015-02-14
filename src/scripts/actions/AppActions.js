'use strict';

var AppDispatcher = require('../dispatchers/AppDispatcher');
var AppConstants = require('../constants/AppConstants');

var AppActions = {
  loadPedigree: function(pedigree) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.LOAD_PEDIGREE,
      pedigree: pedigree
    });
  },

  changeFocus: function(focus) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.CHANGE_FOCUS,
      focus: focus
    });
  },

  addSpouse: function() {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_SPOUSE
    });
  },

  addChild: function(gender) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_CHILD,
      gender: gender
    });
  },

  updateMember: function(data) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UPDATE_MEMBER,
      data: data
    });
  },

  undo: function() {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UNDO
    });
  },

  redo: function() {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.REDO
    });
  }
};

module.exports = AppActions;
