'use strict';

var AppDispatcher = require('../dispatchers/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var PedigreeConstants = require('../constants/PedigreeConstants');
var Immutable = require('immutable');
var _ = require('lodash');


var CHANGE_EVENT = 'change';


// Infinite Immutable.IndexedSeq of strings. Optionally pass a list of strings
// that must not be used.
var generateIds = function(ids) {
  ids = ids || Immutable.List();
  return Immutable.Range(1).map(n => 'id_' + n.toString()).filterNot(id => ids.contains(id));
};


var State = Immutable.Record({
/* TODO: We should start with an empty pedigree, but the autolayout cannot handle
   that yet.

  pedigree: Immutable.Map({
    members: Immutable.List(),
    nests: Immutable.List()
  }),
*/
  pedigree: undefined,
  focus: undefined,
  ids: generateIds()
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


// Get a new ID.
// TODO: This bypasses _updateState, not sure if that's an issue. I think it
//   would be better if changes to _state.ids are passed through _updateState
//   together with any accompanying state changes. However, I'm not sure I
//   like exposing that the id generator is part of the state.
var _newId = function() {
  var ids = _state.ids;
  _state = _state.set('ids', ids.rest());
  return ids.first();
};


var _loadPedigree = function(pedigree) {
  // Where do we use Immutable and where do we convert to plain JS objects?
  // Current approach: use Immutable as much as possible in all stores and
  // components. Convert to plain JS objects for code unrelated to Flux and
  // third-party APIs.
  // Todo: Make both members and nests maps (keys id and father,mother).
  pedigree = Immutable.fromJS(pedigree);

  _state = new State({
    pedigree: pedigree,
    ids: generateIds(pedigree.get('members').map(m => m.get('_id')))
  });
  _undoStack = _undoStack.clear();
  _redoStack = _undoStack.clear();
};


var _updateState = function(action, stateUpdate) {
  var oldState = _state;

  _state = _state.merge(stateUpdate);

  if (_state !== oldState) {
    _undoStack = _undoStack.unshift(new StateChange({
      action: action,
      oldState: oldState
    }));
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


var _changeFocus = function(focus) {
  _state = _state.set('focus', Immutable.fromJS(focus));
};


var _addSpouse = function() {
  var id;
  var other;
  var nest;
  var gender;
  var pedigree;

  if (_state.focus !== undefined && _state.focus.get('level') === PedigreeConstants.FocusLevel.Member) {
    id = _newId();
    other = _state.pedigree.get('members').find(m => m.get('_id') === _state.focus.get('key'));
    nest = Immutable.Map({
      pregnancies: Immutable.List()
    });

    switch (other.get('gender')) {
      case PedigreeConstants.Gender.Male:
        gender = PedigreeConstants.Gender.Female;
        nest = nest.merge({
          father: other.get('_id'),
          mother: id
        });
        break;
      case PedigreeConstants.Gender.Female:
        gender = PedigreeConstants.Gender.Male;
        nest = nest.merge({
          father: id,
          mother: other.get('_id')
        });
        break;
      default:
      case PedigreeConstants.Gender.Unknown:
        gender = PedigreeConstants.Gender.Unknown;
        nest = nest.merge({
          father: other.get('_id'),
          mother: id
        });
        break;
    }

    pedigree = _state.pedigree.update('members', ms => ms.push(Immutable.Map({
      _id: id,
      gender: gender
    }))).update('nests', ns => ns.push(nest));

    _updateState('add spouse with id ' + id.toString(), {
      'pedigree': pedigree
    });

    // simulating immutable data here to trigger re-layout.
    // TODO: do it with real immutable data.
    // _pedigree = _.clone(_pedigree);
  }
};

var _addChild = function(gender) {
  var id;
  var child;
  var pregnancy;
  var pedigree;

  // TODO: how to arrange children order?

  if (_state.focus !== undefined && _state.focus.get('level') === PedigreeConstants.FocusLevel.Nest) {
    id = _newId();
    child = Immutable.Map({_id: id, gender: gender});
    pregnancy = Immutable.Map({
      'zygotes': Immutable.List.of(id)
    });

    pedigree = _state.pedigree.update('nests', ns => {
      return ns.map(n => {
        if (n.get('father') === _state.focus.getIn(['key', 'father']) &&
            n.get('mother') === _state.focus.getIn(['key', 'mother'])) {
          return n.update('pregnancies', ps => ps.push(pregnancy));
        } else {
          return n;
        }
      });
    }).update('members', ms => ms.push(child));

    _updateState('add child with id ' + id.toString(), {
      'pedigree': pedigree
    });

    // simulating immutable data here to trigger re-layout.
    // TODO: do it with real immutable data.
    // _pedigree = _.clone(_pedigree);
  }
};

var _updateMember = function(data) {
  var pedigree;

  if (_state.focus !== undefined && _state.focus.get('level') === PedigreeConstants.FocusLevel.Member) {
    pedigree = _state.pedigree.update('members', ms => {
      return ms.map(m => {
        if (m.get('_id') === _state.focus.get('key')) {
          // Todo: Make sure we're not introducing some nested mutable
          //   data here.
          return m.merge(data);
        } else {
          return m;
        }
      });
    });

    _updateState('update member with id ' + _state.focus.get('key'), {
      'pedigree': pedigree
    });
  }

  // simulating immutable data here to trigger re-layout.
  // TODO: do it with real immutable data.
  // _pedigree = _.clone(_pedigree);
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
      _loadPedigree(action.pedigree);
      break;
    case AppConstants.CHANGE_FOCUS:
      _changeFocus(action.focus);
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
