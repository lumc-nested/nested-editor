'use strict';

var AppDispatcher = require('../dispatchers/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var PedigreeConstants = require('../constants/PedigreeConstants');
var _ = require('lodash');


var CHANGE_EVENT = 'change';

// TODO: at some point this shoudl be replaced by a call to backend sever.
//var _data = require('../../../examples/example.json');


var _counter = 0;
var _pedigree, _focus;

var _newId = function() {
  _counter += 1;
  return _counter;
};

var _loadPedigree = function(pedigree) {
  _pedigree = pedigree;
  _focus = undefined;
  _counter = _.max(_.pluck(pedigree.members, "_id"));
};

var _addSpouse = function() {
  if (_focus === undefined) {
    // do nothing
    console.log('no member is selected.');
  } else {
    var member, spouse, nest;

    member =  _.find(_pedigree.members, {"_id": _focus});
    spouse = {
      _id: _newId()
    };

    switch(member.gender) {
      case PedigreeConstants.Gender.Male:
        spouse.gender = PedigreeConstants.Gender.Female;
        nest = {"father": member._id, "mother": spouse._id};
        break;
      case PedigreeConstants.Gender.Female:
        spouse.gender = PedigreeConstants.Gender.Male;
        nest = {"father": spouse._id, "mother": member._id};
        break;
      default:
      case PedigreeConstants.Gender.Unknown:
        spouse.gender = PedigreeConstants.Gender.Unknown;
        nest = {"father": member._id, "mother": spouse._id};
        break;
    }

    _pedigree.members.push(spouse);
    _pedigree.nests.push(nest);
  }
};


var AppStore = _.extend(EventEmitter.prototype, {
  getData: function(){
    return {
      "pedigree": _pedigree,
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
    case AppConstants.LOAD_PEDIGREE:
      _loadPedigree(action.pedigree);
      break;
    case AppConstants.CHANGE_FOCUS:
      _focus = action.focus;
      break;
    case AppConstants.ADD_SPOUSE:
      _addSpouse();
      break;
    case AppConstants.UPDATE_MEMBER:
      _pedigree.members[_focus].data = action.data;
      break;
  }

  AppStore.emitChange();

});



module.exports = AppStore;
