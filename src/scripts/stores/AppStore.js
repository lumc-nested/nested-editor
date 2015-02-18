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
  if (_focus !== undefined && _focus.level === PedigreeConstants.FocusLevel.Member) {
    var member, spouse, nest;

    member =  _.find(_pedigree.members, {"_id": _focus.key});
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

    nest.pregnancies = [];

    _pedigree.members.push(spouse);
    _pedigree.nests.push(nest);

    // simulating immutable data here to trigger re-layout.
    // TODO: do it with real immutable data.
    _pedigree = _.clone(_pedigree);
  }
};

var _addChild = function(gender) {

  // TODO: how to arrange children order?

  if (_focus !== undefined && _focus.level === PedigreeConstants.FocusLevel.Nest) {
    var child = {
      _id: _newId(),
      gender: gender
    };

    var nest = _.find(_pedigree.nests, {"father": _focus.key.father, "mother": _focus.key.mother});
    nest.pregnancies.push({
      "zygotes" : [child._id]
    });

    _pedigree.members.push(child);

    // simulating immutable data here to trigger re-layout.
    // TODO: do it with real immutable data.
    _pedigree = _.clone(_pedigree);
  }
};

var _updateMember = function(data) {
  if (_focus !== undefined && _focus.level === PedigreeConstants.FocusLevel.Member) {
    var member = _.find(_pedigree.members, {"_id": _focus.key});
    _.assign(member, data);
  }

  // simulating immutable data here to trigger re-layout.
  // TODO: do it with real immutable data.
  _pedigree = _.clone(_pedigree);
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
      _updateMember(action.data);
      break;
    case AppConstants.ADD_CHILD:
      _addChild(action.gender);
      break;
    default:
      console.log('Not implemented yet');
  }

  AppStore.emitChange();

});



module.exports = AppStore;
