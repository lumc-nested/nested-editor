var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');

var ActionTypes = require('../constants/ActionTypes');
var AppDispatcher = require('../dispatchers/AppDispatcher');
var {Document, NestKey, ObjectRef} = require('../common/Structures');


var CHANGE_EVENT = 'change';


var DEFAULT_DOCUMENT = new Document({
  fields: Immutable.Map({title: 'Untitled pedigree'}),
  members: Immutable.Map({
    1: Immutable.Map({gender: 'male', name: 'Father'}),
    2: Immutable.Map({gender: 'female', name: 'Mother'}),
    3: Immutable.Map({father: '1', mother: '2', gender: 'unknown', name: 'Child'})
  })
});


var Snapshot = Immutable.Record({
  label: 'Unknown change',
  document: new Document(),
  focus: new ObjectRef()
});


var _document = DEFAULT_DOCUMENT;
var _focus = new ObjectRef();


// Undo/redo stacks contain Snapshot instances.
var _undoStack = Immutable.Stack();
var _redoStack = Immutable.Stack();


// Generate new member keys.
var _newMemberKeys = function(n) {
  var existingKeys = Immutable.Set.fromKeys(_document.members);

  // Default to 1.
  n = n !== undefined ? n : 1;

  return Immutable.Range(1)
    .map(i => i.toString())
    .filterNot(key => existingKeys.contains(key))
    .take(n);
};


// Generate a new member key.
var _newMemberKey = function() {
  return _newMemberKeys().first();
};


var _setFocus = function(objectRef) {
  _focus = objectRef;
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
  _focus = new ObjectRef();
};


var _addPartner = function(memberKey) {
  var childKey;
  var members;
  var partnerKey;
  var partnerGender;

  partnerKey = _newMemberKey();
  partnerGender =_document.members.get(memberKey).get('gender') === 'male' ? 'female' : 'male';

  // Nests without children are encoded by a dummy child (starting with a ^
  // character).
  childKey = `^no-child-${memberKey}-${partnerKey}`;

  members = _document.members
    .set(partnerKey, Immutable.Map({
      gender: partnerGender
    }))
    .set(childKey, Immutable.Map({
      father: partnerGender === 'male' ? partnerKey : memberKey,
      mother: partnerGender === 'male' ? memberKey : partnerKey
    }));

  _changeDocument(
    'Add partner',
    _document.set('members', members),
    new ObjectRef({
      type: 'member',
      key: partnerKey
    })
  );
};


var _addChild = function(fatherKey, motherKey, gender) {
  var childKey;
  var members;

  childKey = _newMemberKey();

  members = _document.members
    // Remove any leftover dummy children (their keys start with ^).
    // IE: Is String.prototype.startsWith() supported?
    .filterNot((_, memberKey) => memberKey.startsWith('^'))
    .set(childKey, Immutable.Map({
      gender,
      father: fatherKey,
      mother: motherKey
    }));

  _changeDocument(
    'Add child',
    _document.set('members', members),
    new ObjectRef({
      type: 'member',
      key: childKey
    })
  );
};


var _addParents = function(memberKey) {
  var fatherKey;
  var motherKey;
  var members;

  [fatherKey, motherKey] = _newMemberKeys(2).toArray();

  members = _document.members
    .merge({
      [fatherKey]: Immutable.Map({gender: 'male'}),
      [motherKey]: Immutable.Map({gender: 'female'})
    })
    .update(memberKey, member => member.merge({
      father: fatherKey,
      mother: motherKey
    }));

  _changeDocument(
    'Add parents',
    _document.set('members', members),
    new ObjectRef({
      type: 'nest',
      key: new NestKey({father: fatherKey, mother: motherKey})
    })
  );
};


var _addTwin = function(memberKey) {
  var member;
  var members;
  var monozygote;
  var twinKey;

  // TODO: Dizygote twins.

  member = _document.members.get(memberKey);
  monozygote = member.get('monozygote', `monozygote-${memberKey}`);
  twinKey = _newMemberKey();

  members = _document.members
    .set(twinKey, Immutable.Map({
      gender: member.get('gender'),
      father: member.get('father'),
      mother: member.get('mother'),
      monozygote: monozygote
    }))
    .set(memberKey, member.set('monozygote', monozygote));

  _changeDocument(
    'Add twin',
    _document.set('members', members),
    new ObjectRef({
      type: 'member',
      key: twinKey
    })
  );
};


var _deleteMember = function(memberKey) {
  var member;
  var members;

  member = _document.members.get(memberKey);

  members = _document.members
    .delete(memberKey)
    // Delete any children (should only be dummy children).
    .filterNot(m => m.get('father') === memberKey || m.get('mother') === memberKey);

  // If this was the last child in a nest, add a dummy child.
  if (member.get('father') &&
      member.get('mother') &&
      !members.some(m => m.get('father') === member.get('father') && m.get('mother') === member.get('mother'))) {
    members = members.set(
      `^no-child-${member.get('father')}-${member.get('mother')}`,
      Immutable.Map({
        father: member.get('father'),
        mother: member.get('mother')
      }));
  }

  // TODO: If this was one of a twins (size two), the remaining should no
  // longer have the twin field set.

  _changeDocument(
    'Delete member',
    _document.set('members', members),
    new ObjectRef({
      type: 'pedigree'
    })
  );
};


var _updateMemberFields = function(memberKey, fields) {
  // TODO: We currently have to `setIn` instead of `mergeIn`, which I would
  //   actually prefer (so we can use this action to selectively update a
  //   subset of fields). However, empty field values are currently lost by
  //   plexus-form, so this is a workaround to enable the user to empty
  //   fields.
  //   https://github.com/AppliedMathematicsANU/plexus-form/issues/31
  _changeDocument(
    'Update member fields',
    _document.setIn(['members', memberKey], Immutable.fromJS(fields))
  );
};


var _addCustomMemberField = function(field, schema) {
  _changeDocument(
    'Add custom field',
    _document.setIn(['customMemberFieldSchemas', field], Immutable.Map(schema))
  );
};


var _deleteCustomMemberField = function(field) {
  var members = _document.members;
  var schemas = _document.customMemberFieldSchemas;

  _changeDocument(
    'Remove custom field',
    _document.merge({
      members: members.map(member => member.delete(field)),
      customMemberFieldSchemas: schemas.delete(field)
    })
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
      _setFocus(action.objectRef);
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
    case ActionTypes.ADD_PARTNER:
      _addPartner(action.memberKey);
      break;
    case ActionTypes.ADD_CHILD:
      _addChild(action.fatherKey, action.motherKey, action.gender);
      break;
    case ActionTypes.ADD_PARENTS:
      _addParents(action.memberKey);
      break;
    case ActionTypes.ADD_TWIN:
      _addTwin(action.memberKey);
      break;
    case ActionTypes.DELETE_MEMBER:
      _deleteMember(action.memberKey);
      break;
    case ActionTypes.UPDATE_MEMBER_FIELDS:
      _updateMemberFields(action.memberKey, action.fields);
      break;
    case ActionTypes.ADD_CUSTOM_MEMBER_FIELD:
      _addCustomMemberField(action.field, action.schema);
      break;
    case ActionTypes.DELETE_CUSTOM_MEMBER_FIELD:
      _deleteCustomMemberField(action.field);
      break;
    default:
  }

  DocumentStore.emitChange();
});


module.exports = DocumentStore;
