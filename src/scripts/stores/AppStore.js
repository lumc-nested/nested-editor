'use strict';

var AppDispatcher = require('../dispatchers/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var _ = require('lodash');

var CHANGE_EVENT = 'change';

var _data = {
  data: require('../../example.json'),
  focus: undefined
};

var AppStore = _.extend(EventEmitter.prototype, {

  getData: function(){
    return _data;
  },

  emitChange: function(){
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback){
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback){
    this.removeListener(CHANGE_EVENT, callback);
  }
});

AppDispatcher.register(function(payload){
  var action = payload.action;
  console.log('STORE DISPATCHER REGISTER', action);

  switch(action.actionType) {
    case AppConstants.CHANGE_FOCUS:
      _data.focus = action.focus;
      break;
  }

  AppStore.emitChange();

});



module.exports = AppStore;
