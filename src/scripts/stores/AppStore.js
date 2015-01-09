'use strict';

var AppDispatcher = require('../dispatchers/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var PedigreeConstants = require('../constants/PedigreeConstants');
var _ = require('lodash');

var CHANGE_EVENT = 'change';

var _data = require('../../example.json');
var _focus = undefined;


var _addSpouse = function() {
  if (_focus === undefined) {
    // do nothing
    console.log('no member is selected.');
  } else {
    var member, newMember, newNest;

    member =  _.find(_data.members, {id: _focus});
    newMember = { "id":  _.uniqueId("tmp_") };

    switch(member.gender) {
      case PedigreeConstants.Gender.Male:
        newMember["gender"] = PedigreeConstants.Gender.Female;
        newNest = { "father": member.id, "mother": newMember.id };
        break;
      case PedigreeConstants.Gender.Female:
        newMember["gender"] = PedigreeConstants.Gender.Male;
        newNest = { "father": newMember.id, "mother": member.id };
        break;
      case PedigreeConstants.Gender.Unknown:
        newMember["gender"] = PedigreeConstants.Gender.Unknown;
        newNest = { "father": member.id, "mother": newMember.id };
        break;
    }

    _data.members.push(newMember);
    _data.nests.push(newNest);
  }
};


var AppStore = _.extend(EventEmitter.prototype, {

  getData: function(){
    return {
      "data": _data,
      "focus": _focus
    };
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
      _focus = action.focus;
      break;
    case AppConstants.ADD_SPOUSE:
      _addSpouse();
      break;
  }

  AppStore.emitChange();

});



module.exports = AppStore;
