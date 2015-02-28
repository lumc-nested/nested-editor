'use strict';


var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');

var ActionTypes = require('../constants/ActionTypes');
var AppDispatcher = require('../dispatchers/AppDispatcher');
var Structures = require('../common/Structures');
var AppConstants = require('../constants/AppConstants');


var Document = Structures.Document;
var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;
var Pregnancy = Structures.Pregnancy;


var Focus = Immutable.Record({
  level: AppConstants.FocusLevel.Pedigree,
  key: undefined
});


var Snapshot = Immutable.Record({
  label: 'Unknown change',
  document: new Document(),
  focus: new Focus()
});


var CHANGE_EVENT = 'change';


var DEFAULT_DOCUMENT = new Document({
  pedigree: new Pedigree({
    members: Immutable.Map({
      id_1: Immutable.Map({gender: AppConstants.Gender.Male}),
      id_2: Immutable.Map({gender: AppConstants.Gender.Female})
    }),
    nests: Immutable.Map([
      [Immutable.Set.of('id_1', 'id_2'),
       new Nest()]
    ])
  })
});


var _document = DEFAULT_DOCUMENT;
var _focus = new Focus();


// Undo/redo stacks contain Snapshot instances.
var _undoStack = Immutable.Stack();
var _redoStack = Immutable.Stack();


// Generate a new member key.
var _newMemberKey = function() {
  var existingKeys = Immutable.Set.fromKeys(_document.pedigree.members);

  return Immutable.Range(1)
    .map(n => 'id_' + n.toString())
    .filterNot(key => existingKeys.contains(key))
    .first();
};


var _setFocus = function(level, key) {
  _focus = new Focus({level, key});
};


var _changeDocument = function(label, document, focus) {
  focus = focus || _focus;

  _undoStack = _undoStack.unshift(new Snapshot({
    label: label,
    document: _document,
    focus: _focus
  }));
  _redoStack = _redoStack.clear();

  _document = document;
  _focus = focus;
};


var _undo = function() {
  var snapshot;

  if (_undoStack.size > 0) {
    snapshot = _undoStack.peek();

    _redoStack = _redoStack.unshift(new Snapshot({
      label: snapshot.label,
      document: _document,
      focus: _focus
    }));
    _undoStack = _undoStack.shift();

    _document = snapshot.document;
    _focus = snapshot.focus;
  }
};


var _redo = function() {
  var snapshot;

  if (_redoStack.size > 0) {
    snapshot = _redoStack.peek();

    _undoStack = _undoStack.unshift(new Snapshot({
      label: snapshot.label,
      document: _document,
      focus: _focus
    }));
    _redoStack = _redoStack.shift();

    _document = snapshot.document;
    _focus = snapshot.focus;
  }
};


var _openDocument = function(document) {
  _undoStack = _undoStack.clear();
  _redoStack = _redoStack.clear();

  _document = document;
  _focus = new Focus();
};


var _addSpouse = function(memberKey) {
  var pedigree = _document.pedigree;
  var member;
  var spouse;
  var spouseKey;

  member = pedigree.members.get(memberKey);

  switch (member.get('gender')) {
    case AppConstants.Gender.Male:
      spouse = Immutable.Map({gender: AppConstants.Gender.Female});
      break;
    case AppConstants.Gender.Female:
      spouse = Immutable.Map({gender: AppConstants.Gender.Male});
      break;
    case AppConstants.Gender.Unknown:
    default:
      spouse = Immutable.Map({gender: AppConstants.Gender.Unknown});
  }

  spouseKey = _newMemberKey();
  pedigree = pedigree
    .update('members', members => members.set(spouseKey, spouse))
    .update('nests', nests => nests.set(Immutable.Set.of(memberKey, spouseKey),
                                        new Nest()));

  _changeDocument(
    'Add spouse',
    _document.set('pedigree', pedigree),
    new Focus({
      level: AppConstants.FocusLevel.Member,
      key: spouseKey
    })
  );
};


var _addChild = function(nestKey, gender) {
  var pedigree = _document.pedigree;
  var child;
  var childKey;
  var pregnancy;

  child = Immutable.Map({gender});
  childKey = _newMemberKey();

  pregnancy = new Pregnancy({zygotes: Immutable.List.of(childKey)});

  pedigree = pedigree
    .update('members', members => members.set(childKey, child))
    .updateIn(['nests', nestKey, 'pregnancies'],
              pregnancies => pregnancies.push(pregnancy));

  _changeDocument(
    'Add child',
    _document.set('pedigree', pedigree),
    new Focus({
      level: AppConstants.FocusLevel.Member,
      key: childKey
    })
  );
};


var _updateMember = function(memberKey, fields) {
  _changeDocument(
    'Update member fields',
    _document.mergeIn(['pedigree', 'members', memberKey], fields)
  );
};


var _updateNest = function(nestKey, fields) {
  _changeDocument(
    'Update nest fields',
    _document.mergeIn(['pedigree', 'nests', nestKey, 'fields'], fields)
  );
};


var _updatePedigree = function(fields) {
  _changeDocument(
    'Update pedigree fields',
    _document.mergeIn(['pedigree', 'fields'], fields)
  );
};


var DocumentStore = assign({}, EventEmitter.prototype, {
  getFocus: function() {
    return _focus;
  },

  getUndo: function() {
    return _undoStack.size > 0 ? _undoStack.peek().label : undefined;
  },

  getRedo: function() {
    return _redoStack.size > 0 ? _redoStack.peek().label : undefined;
  },

  getDocument: function() {
    return _document;
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


AppDispatcher.register(function(action) {
  switch (action.actionType) {
    case ActionTypes.SET_FOCUS:
      _setFocus(action.level, action.key);
      break;
    case ActionTypes.UNDO:
      _undo();
      break;
    case ActionTypes.REDO:
      _redo();
      break;
    case ActionTypes.OPEN_DOCUMENT:
      _openDocument(action.document);
      break;
    case ActionTypes.ADD_SPOUSE:
      _addSpouse(action.memberKey);
      break;
    case ActionTypes.ADD_CHILD:
      _addChild(action.nestKey, action.gender);
      break;
    case ActionTypes.UPDATE_MEMBER:
      _updateMember(action.memberKey, action.fields);
      break;
    case ActionTypes.UPDATE_NEST:
      _updateNest(action.nestKey, action.fields);
      break;
    case ActionTypes.UPDATE_PEDIGREE:
      _updatePedigree(action.fields);
      break;
    default:
  }

  DocumentStore.emitChange();
});


module.exports = DocumentStore;
