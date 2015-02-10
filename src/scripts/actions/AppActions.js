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

  changeFocus: function(focus){
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

  addChild: function() {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_CHILD
    });
  },

  updateMember: function(data) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.UPDATE_MEMBER,
      data: data
    });
  }
};

module.exports = AppActions;
