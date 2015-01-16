'use strict';

var AppDispatcher = require('../dispatchers/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var PedigreeConstants = require('../constants/PedigreeConstants');
var _ = require('lodash');
var Pedigree = require('../core/Pedigree.js');
var Member = require('../core/Member.js');
var Nest = require('../core/Nest.js');

var Individual = Member.Individual;

var CHANGE_EVENT = 'change';

// TODO: at some point this shoudl be replaced by a call to backend sever.
var _data = require('../../../examples/example.json');


var _counter = 0;
var _pedigree, _focus;

var _newId = function() {
  _counter += 1;
  return _counter;
};

var _addSpouse = function() {
  if (_focus === undefined) {
    // do nothing
    console.log('no member is selected.');
  } else {
    var member, spouse, spouseData, nest;

    member =  _pedigree.members[_focus];
    spouseData = {
      _id: _newId()
    };

    switch(member.gender()) {
      case PedigreeConstants.Gender.Male:
        spouseData.gender = PedigreeConstants.Gender.Female;
        spouse = new Individual(spouseData);
        nest = new Nest(member, spouse);
        break;
      case PedigreeConstants.Gender.Female:
        spouseData.gender = PedigreeConstants.Gender.Male;
        spouse = new Individual(spouseData);
        nest = new Nest(spouse, member);
        break;
      default:
      case PedigreeConstants.Gender.Unknown:
        spouseData.gender = PedigreeConstants.Gender.Unknown;
        spouse = new Individual(spouseData);
        nest = new Nest(member, spouse);
        break;
    }

    _pedigree.members[spouse._id] = spouse;
    _pedigree.nests.push(nest);
  }
};


var AppStore = _.extend(EventEmitter.prototype, {

  getData: function(){
    // initialize the counter.
    _counter = _.max(_.pluck(_data.members, "_id"));

    // initialize pedigree.
    if (_pedigree === undefined) {
      _pedigree = new Pedigree(_data);
    }

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
    case AppConstants.CHANGE_FOCUS:
      _focus = action.focus;
      break;
    case AppConstants.ADD_SPOUSE:
      _addSpouse();
      break;
    case AppConstants.UPDATE_MEMBER:
      _pedigree.members[action.data._id] = _.omit(action.data, "_id");
      break;
  }

  AppStore.emitChange();

});



module.exports = AppStore;
