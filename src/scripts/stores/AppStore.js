'use strict';


var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');

var AppConstants = require('../constants/AppConstants');
var AppDispatcher = require('../dispatchers/AppDispatcher');
var Structures = require('../common/Structures');
var PedigreeConstants = require('../constants/PedigreeConstants');


var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;
var Pregnancy = Structures.Pregnancy;

var CHANGE_EVENT = 'change';


var Focus = Immutable.Record({
  level: PedigreeConstants.Pedigree,
  key: undefined
});


// TODO: Focus shouldn't be in the undo/redo stack. I guess we should have
//   a separate Document structure containing pedigree and schema (everything
//   that is in the file basically) and only manage that with undo/redo.
//   Or separate ApplicationState and DocumentState, perhaps also in separate
//   stores.
var State = Immutable.Record({
  pedigree: new Pedigree({
    members: Immutable.Map({
      id_1: Immutable.Map({gender: PedigreeConstants.Gender.Male}),
      id_2: Immutable.Map({gender: PedigreeConstants.Gender.Female})
    }),
    nests: Immutable.Map([
      [Immutable.Set.of('id_1', 'id_2'),
       new Nest()]
    ])
  }),
  // TODO: Perhaps it is better to just have the separate pedigree/nest/member
  //   schema definitions here? Downside is that we break potential cross-refs
  //   but I guess we cannot handle them anyway. Let's first test if we can
  //   give plexus-form a complete schema as context (with definitions) and
  //   use these definitions from the specific schema.
  schemaExtension: Immutable.Map(),
  focus: new Focus()
});


var StateChange = Immutable.Record({
  action: 'unknown action',
  oldState: new State()
});


// Application state.
var _state = new State();


// Contains StateChange objects.
var _undoStack = Immutable.Stack();
var _redoStack = Immutable.Stack();


// Generate a new member key.
var newMemberKey = function() {
  var existingKeys = Immutable.Set.fromKeys(_state.pedigree.members);

  return Immutable.Range(1)
    .map(n => 'id_' + n.toString())
    .filterNot(key => existingKeys.contains(key))
    .first();
};


var _loadPedigree = function(pedigree, schemaExtension) {
  _state = new State({pedigree, schemaExtension});
  _undoStack = _undoStack.clear();
  _redoStack = _undoStack.clear();
};


var _updateState = function(action, stateUpdate) {
  var oldState = _state;

  _state = _state.merge(stateUpdate);
  if (_state !== oldState) {
    _undoStack = _undoStack.unshift(new StateChange({action, oldState}));
    _redoStack = _redoStack.clear();
  }
};


var _undo = function() {
  var change;

  if (_undoStack.size > 0) {
    change = _undoStack.peek();
    _redoStack = _redoStack.unshift(change.set('oldState', _state));
    _state = change.oldState;
    _undoStack = _undoStack.shift();
  }
};


var _redo = function() {
  var change;

  if (_redoStack.size > 0) {
    change = _redoStack.peek();
    _undoStack = _undoStack.unshift(change.set('oldState', _state));
    _state = change.oldState;
    _redoStack = _redoStack.shift();
  }
};


var _changeFocus = function(level, key) {
  _state = _state.set('focus', new Focus({level, key}));
};


var _addSpouse = function() {
  var pedigree = _state.pedigree;
  var member;
  var spouse;
  var spouseKey;

  if (_state.focus.level === PedigreeConstants.FocusLevel.Member) {
    member = pedigree.members.get(_state.focus.key);

    switch (member.get('gender')) {
      case PedigreeConstants.Gender.Male:
        spouse = Immutable.Map({gender: PedigreeConstants.Gender.Female});
        break;
      case PedigreeConstants.Gender.Female:
        spouse = Immutable.Map({gender: PedigreeConstants.Gender.Male});
        break;
      default:
      case PedigreeConstants.Gender.Unknown:
        spouse = Immutable.Map({gender: PedigreeConstants.Gender.Unknown});
        break;
    }

    spouseKey = newMemberKey();
    pedigree = pedigree
      .update('members', members => members.set(spouseKey, spouse))
      .update('nests', nests => nests.set(Immutable.Set.of(_state.focus.key, spouseKey),
                                          new Nest()));

    _updateState('add spouse with id ' + spouseKey.toString(), {pedigree});
  }
};


var _addChild = function(gender) {
  var pedigree = _state.pedigree;
  var child;
  var childKey;
  var pregnancy;

  // TODO: how to arrange children order?

  if (_state.focus.level === PedigreeConstants.FocusLevel.Nest) {
    child = Immutable.Map({gender});
    childKey = newMemberKey();

    pregnancy = new Pregnancy({zygotes: Immutable.List.of(childKey)});

    pedigree = pedigree
      .update('members', members => members.set(childKey, child))
      .updateIn(['nests', _state.focus.key, 'pregnancies'],
                pregnancies => pregnancies.push(pregnancy));

    _updateState('add child with id ' + childKey.toString(), {pedigree});
  }
};


var _updateMember = function(data) {
  var pedigree = _state.pedigree;

  if (_state.focus.level === PedigreeConstants.FocusLevel.Member) {
    pedigree = pedigree.mergeIn(['members', _state.focus.key], data);
    _updateState('update member with id ' + _state.focus.key, {pedigree});
  }
};


var _updateNest = function(data) {
  var pedigree = _state.pedigree;

  if (_state.focus.level === PedigreeConstants.FocusLevel.Nest) {
    pedigree = pedigree.mergeIn(['nests', _state.focus.key, 'props'], data);
    _updateState('update nest with parent ids ' + _state.focus.key.toString(), {pedigree});
  }
};


var _updatePedigree = function(data) {
  var pedigree = _state.pedigree;

  if (_state.focus.level === PedigreeConstants.FocusLevel.Pedigree) {
    pedigree = pedigree.update('props', props => props.merge(data));
    _updateState('update pedigree', {pedigree});
  }
};


var AppStore = _.extend(EventEmitter.prototype, {
  getData: function() {
    var undoAction, redoAction;
    if (_undoStack.size > 0) {
      undoAction = _undoStack.peek().action;
    }
    if (_redoStack.size > 0) {
      redoAction = _redoStack.peek().action;
    }
    return {
      'pedigree': _state.pedigree,
      'schemaExtension': _state.schemaExtension,
      'focus': _state.focus,
      'undoAction': undoAction,
      'redoAction': redoAction
    };
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

AppDispatcher.register(function(payload) {
  var action = payload.action;
  console.log('STORE DISPATCHER REGISTER', action);

  switch (action.actionType) {
    case AppConstants.LOAD_PEDIGREE:
      // TODO: Rename to loadDocument.
      _loadPedigree(action.pedigree, action.schemaExtension);
      break;
    case AppConstants.CHANGE_FOCUS:
      _changeFocus(action.level, action.key);
      break;
    case AppConstants.ADD_SPOUSE:
      _addSpouse();
      break;
    case AppConstants.UPDATE_MEMBER:
      _updateMember(action.data);
      break;
    case AppConstants.UPDATE_NEST:
      _updateNest(action.data);
      break;
    case AppConstants.UPDATE_PEDIGREE:
      _updatePedigree(action.data);
      break;
    case AppConstants.ADD_CHILD:
      _addChild(action.gender);
      break;
    case AppConstants.UNDO:
      _undo();
      break;
    case AppConstants.REDO:
      _redo();
      break;
    default:
      console.log('Not implemented yet');
  }

  AppStore.emitChange();

});


module.exports = AppStore;
