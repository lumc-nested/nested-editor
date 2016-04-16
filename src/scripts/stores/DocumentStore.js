var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');

var ActionTypes = require('../constants/ActionTypes');
var AppDispatcher = require('../dispatchers/AppDispatcher');
var {Document, MatingKey, ObjectRef} = require('../common/Structures');


var CHANGE_EVENT = 'change';


var DEFAULT_DOCUMENT = new Document({
  fields: Immutable.Map({title: 'Untitled pedigree'}),
  individuals: Immutable.Map({
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


// Generate new individual keys.
var _newIndividualKeys = function(n) {
  var existingKeys = Immutable.Set.fromKeys(_document.individuals);

  // Default to 1.
  n = n !== undefined ? n : 1;

  return Immutable.Range(1)
    .map(i => i.toString())
    .filterNot(key => existingKeys.contains(key))
    .take(n);
};


// Generate a new individual key.
var _newIndividualKey = function() {
  return _newIndividualKeys().first();
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


var _addPartner = function(individualKey) {
  var childKey;
  var individuals;
  var partnerKey;
  var partnerGender;

  partnerKey = _newIndividualKey();
  partnerGender =_document.individuals.get(individualKey).get('gender') === 'male' ? 'female' : 'male';

  // Matings without children are encoded by a dummy child (starting with a ^
  // character).
  childKey = `^no-child-${individualKey}-${partnerKey}`;

  individuals = _document.individuals
    .set(partnerKey, Immutable.Map({
      gender: partnerGender
    }))
    .set(childKey, Immutable.Map({
      father: partnerGender === 'male' ? partnerKey : individualKey,
      mother: partnerGender === 'male' ? individualKey : partnerKey
    }));

  _changeDocument(
    'Add partner',
    _document.set('individuals', individuals),
    new ObjectRef({
      type: 'individual',
      key: partnerKey
    })
  );
};


var _addChild = function(fatherKey, motherKey, gender) {
  var childKey;
  var individuals;

  childKey = _newIndividualKey();

  individuals = _document.individuals
    // Remove any leftover dummy children (their keys start with ^).
    // IE: Is String.prototype.startsWith() supported?
    .filterNot((_, individualKey) => individualKey.startsWith('^'))
    .set(childKey, Immutable.Map({
      gender,
      father: fatherKey,
      mother: motherKey
    }));

  _changeDocument(
    'Add child',
    _document.set('individuals', individuals),
    new ObjectRef({
      type: 'individual',
      key: childKey
    })
  );
};


var _addParents = function(individualKey) {
  var fatherKey;
  var motherKey;
  var individuals;

  [fatherKey, motherKey] = _newIndividualKeys(2).toArray();

  individuals = _document.individuals
    .merge({
      [fatherKey]: Immutable.Map({gender: 'male'}),
      [motherKey]: Immutable.Map({gender: 'female'})
    })
    .update(individualKey, individual => individual.merge({
      father: fatherKey,
      mother: motherKey
    }));

  _changeDocument(
    'Add parents',
    _document.set('individuals', individuals),
    new ObjectRef({
      type: 'mating',
      key: new MatingKey({father: fatherKey, mother: motherKey})
    })
  );
};


var _addTwin = function(individualKey) {
  var individual;
  var individuals;
  var monozygote;
  var twinKey;

  // TODO: Dizygote twins.

  individual = _document.individuals.get(individualKey);
  monozygote = individual.get('monozygote', `monozygote-${individualKey}`);
  twinKey = _newIndividualKey();

  individuals = _document.individuals
    .set(twinKey, Immutable.Map({
      gender: individual.get('gender'),
      father: individual.get('father'),
      mother: individual.get('mother'),
      monozygote: monozygote
    }))
    .set(individualKey, individual.set('monozygote', monozygote));

  _changeDocument(
    'Add twin',
    _document.set('individuals', individuals),
    new ObjectRef({
      type: 'individual',
      key: twinKey
    })
  );
};


var _deleteIndividual = function(individualKey) {
  var individual;
  var individuals;

  individual = _document.individuals.get(individualKey);

  individuals = _document.individuals
    .delete(individualKey)
    // Delete any children (should only be dummy children).
    .filterNot(m => m.get('father') === individualKey || m.get('mother') === individualKey);

  // If this was the last child in a mating, add a dummy child.
  if (individual.get('father') &&
      individual.get('mother') &&
      !individuals.some(m => (m.get('father') === individual.get('father') &&
                              m.get('mother') === individual.get('mother')))) {
    individuals = individuals.set(
      `^no-child-${individual.get('father')}-${individual.get('mother')}`,
      Immutable.Map({
        father: individual.get('father'),
        mother: individual.get('mother')
      }));
  }

  // TODO: If this was one of a twins (size two), the remaining should no
  // longer have the twin field set.

  _changeDocument(
    'Delete individual',
    _document.set('individuals', individuals),
    new ObjectRef({
      type: 'document'
    })
  );
};


var _updateIndividualFields = function(individualKey, fields) {
  // TODO: We currently have to `setIn` instead of `mergeIn`, which I would
  //   actually prefer (so we can use this action to selectively update a
  //   subset of fields). However, empty field values are currently lost by
  //   plexus-form, so this is a workaround to enable the user to empty
  //   fields.
  //   https://github.com/AppliedMathematicsANU/plexus-form/issues/31
  _changeDocument(
    'Update individual fields',
    _document.setIn(['individuals', individualKey], Immutable.fromJS(fields))
  );
};


var _addCustomIndividualField = function(field, schema) {
  _changeDocument(
    'Add custom field',
    _document.setIn(['customIndividualFieldSchemas', field], Immutable.Map(schema))
  );
};


var _deleteCustomIndividualField = function(field) {
  var individuals = _document.individuals;
  var schemas = _document.customIndividualFieldSchemas;

  _changeDocument(
    'Remove custom field',
    _document.merge({
      individuals: individuals.map(individual => individual.delete(field)),
      customIndividualFieldSchemas: schemas.delete(field)
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
      _addPartner(action.individualKey);
      break;
    case ActionTypes.ADD_CHILD:
      _addChild(action.fatherKey, action.motherKey, action.gender);
      break;
    case ActionTypes.ADD_PARENTS:
      _addParents(action.individualKey);
      break;
    case ActionTypes.ADD_TWIN:
      _addTwin(action.individualKey);
      break;
    case ActionTypes.DELETE_INDIVIDUAL:
      _deleteIndividual(action.individualKey);
      break;
    case ActionTypes.UPDATE_INDIVIDUAL_FIELDS:
      _updateIndividualFields(action.individualKey, action.fields);
      break;
    case ActionTypes.ADD_CUSTOM_INDIVIDUAL_FIELD:
      _addCustomIndividualField(action.field, action.schema);
      break;
    case ActionTypes.DELETE_CUSTOM_INDIVIDUAL_FIELD:
      _deleteCustomIndividualField(action.field);
      break;
    default:
  }

  DocumentStore.emitChange();
});


module.exports = DocumentStore;
