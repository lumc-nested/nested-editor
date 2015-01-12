'use strict';

var AppDispatcher = require('../dispatchers/AppDispatcher');
var AppConstants = require('../constants/AppConstants');

var AppActions = {
  changeFocus: function(id){
    AppDispatcher.handleViewAction({
      actionType: AppConstants.CHANGE_FOCUS,
      focus: id
    });
  },

  addSpouse: function() {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_SPOUSE
    });
  }
};

module.exports = AppActions;
