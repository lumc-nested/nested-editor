'use strict';
var AppDispatcher = require('../dispatchers/AppDispatcher');
var AppConstants = require('../constants/AppConstants');

var AppActions = {
  changeFocus: function(id){
    AppDispatcher.handleViewAction({
      actionType: AppConstants.CHANGE_FOCUS,
      focus: id
    });
  }
};

module.exports = AppActions;