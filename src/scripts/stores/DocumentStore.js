var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');

var ActionTypes = require('../constants/ActionTypes');
var AppDispatcher = require('../dispatchers/AppDispatcher');
var AppConstants = require('../constants/AppConstants');
var {Document, Nest, Pedigree, Pregnancy, Member, ObjectRef} = require('../common/Structures');


var CHANGE_EVENT = 'change';


var DEFAULT_DOCUMENT = new Document({
  pedigree: new Pedigree({
    members: Immutable.Map({
      1: new Member({fields: Immutable.Map({gender: AppConstants.Gender.Male})}),
      2: new Member({fields: Immutable.Map({gender: AppConstants.Gender.Female})})
    }),
    nests: Immutable.Map([
      [Immutable.Set.of('1', '2'),
       new Nest()]
    ])
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
  var existingKeys = Immutable.Set.fromKeys(_document.pedigree.members);

  // default to 1.
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
  var pedigree = _document.pedigree;
  var member;
  var fields;
  var partnerKey;

  member = pedigree.members.get(memberKey);

  switch (member.fields.get('gender')) {
    case AppConstants.Gender.Male:
      fields = Immutable.Map({gender: AppConstants.Gender.Female});
      break;
    case AppConstants.Gender.Female:
      fields = Immutable.Map({gender: AppConstants.Gender.Male});
      break;
    case AppConstants.Gender.Unknown:
    default:
      fields = Immutable.Map({gender: AppConstants.Gender.Unknown});
  }

  partnerKey = _newMemberKey();
  pedigree = pedigree
    .update('members', members => members.set(partnerKey, new Member({fields})))
    .update('nests', nests => nests.set(Immutable.Set.of(memberKey, partnerKey),
                                        new Nest()));

  _changeDocument(
    'Add partner',
    _document.set('pedigree', pedigree),
    new ObjectRef({
      type: AppConstants.ObjectType.Member,
      key: partnerKey
    })
  );
};


var _addChild = function(nestKey, gender) {
  var pedigree = _document.pedigree;
  var child;
  var childKey;
  var pregnancy;

  child = new Member({
    parents: nestKey,
    fields: Immutable.Map({gender})
  });

  childKey = _newMemberKey();

  pregnancy = new Pregnancy({children: Immutable.List.of(childKey)});

  pedigree = pedigree
    .update('members', members => members.set(childKey, child))
    .updateIn(['nests', nestKey, 'pregnancies'],
              pregnancies => pregnancies.push(pregnancy));

  _changeDocument(
    'Add child',
    _document.set('pedigree', pedigree),
    new ObjectRef({
      type: AppConstants.ObjectType.Member,
      key: childKey
    })
  );
};


var _addParents = function(memberKey) {
  var pedigree = _document.pedigree;
  var father;
  var mother;
  var fatherKey;
  var motherKey;
  var nestKey;

  father = new Member({fields: Immutable.Map({gender: AppConstants.Gender.Male})});
  mother = new Member({fields: Immutable.Map({gender: AppConstants.Gender.Female})});

  [fatherKey, motherKey] = _newMemberKeys(2).toArray();
  nestKey = Immutable.Set.of(fatherKey, motherKey);

  pedigree = pedigree
    .update('members',
            members => members
                        .set(fatherKey, father)
                        .set(motherKey, mother)
                        .update(memberKey, member => member.set('parents', nestKey)))
    .update('nests',
            nests => nests.set(nestKey, new Nest({
              pregnancies: Immutable.List.of(new Pregnancy({children: Immutable.List.of(memberKey)}))
            })));

  _changeDocument(
    'Add parents',
    _document.set('pedigree', pedigree),
    new ObjectRef({
      type: AppConstants.ObjectType.Nest,
      key: nestKey
    })
  );
};


var _addTwin = function(memberKey) {
  var pedigree = _document.pedigree;
  var member;
  var twin;
  var twinKey;

  member = pedigree.members.get(memberKey);
  twin = new Member({
    parents: member.parents,
    fields: Immutable.Map({gender: member.fields.get('gender')})
  });

  twinKey = _newMemberKey();

  pedigree = pedigree
    .update('members', members => members.set(twinKey, twin))
    .updateIn(['nests', member.parents, 'pregnancies'],
      pregnancies => pregnancies.map(pregnancy => {
        if (pregnancy.children.contains(memberKey)) {
          return pregnancy
            .update('children', children => children.push(twinKey))
            .update('zygotes', zygotes => zygotes === undefined ? zygotes : zygotes.push(zygotes.max() + 1));
        }

        return pregnancy;
      }));

  _changeDocument(
    'Add twin',
    _document.set('pedigree', pedigree),
    new ObjectRef({
      type: AppConstants.ObjectType.Member,
      key: twinKey
    })
  );
};


var _deleteMember = function(memberKey) {
  var pedigree = _document.pedigree;
  var member = pedigree.members.get(memberKey);
  var matingNests = pedigree.nests.filter((n, nk) => nk.has(memberKey));

  // remove member
  pedigree = pedigree
    .update('members', members => members.delete(memberKey));

  // remove members nests
  if (matingNests.size) {
    pedigree = pedigree
      .update('nests', nests => nests.filterNot((n, nk) => matingNests.has(nk)));
  }

  // remove member from his/her parents' nest
  if (member.parents.size) {
    pedigree = pedigree
      .updateIn(['nests', member.parents, 'pregnancies'],
        pregnancies => pregnancies
          .map(pregnancy => {
            var index = pregnancy.children.indexOf(memberKey);
            if (index >= 0) {
              return pregnancy
                .update('children', children => children.delete(index))
                .update('zygotes', zygotes => zygotes === undefined ? zygotes : zygotes.delete(index));
            } else {
              return pregnancy;
            }
          })
          .filter(pregnancy => pregnancy.children.size)
      );
  }

  _changeDocument(
    'Delete member',
    _document.set('pedigree', pedigree),
    new ObjectRef({
      type: AppConstants.ObjectType.Pedigree
    })
  );
};


var _updateFields = function(objectRef, fields) {
  var label;
  var path;

  switch (objectRef.type) {
    case AppConstants.ObjectType.Member:
      label = 'Update member fields';
      path = ['pedigree', 'members', objectRef.key, 'fields'];
      break;
    case AppConstants.ObjectType.Nest:
      label = 'Update nest fields';
      path = ['pedigree', 'nests', objectRef.key, 'fields'];
      break;
    case AppConstants.ObjectType.Pedigree:
    default:
      label = 'Update pedigree fields';
      path = ['pedigree', 'fields'];
  }

  // TODO: We currently have to `setIn` instead of `mergeIn`, which I would
  //   actually prefer (so we can use this action to selectively update a
  //   subset of fields). However, empty field values are currently lost by
  //   plexus-form, so this is a workaround to enable the user to empty
  //   fields.
  //   https://github.com/AppliedMathematicsANU/plexus-form/issues/31
  _changeDocument(
    label,
    _document.setIn(path, Immutable.fromJS(fields))
  );
};


var _addField = function(objectType, field, schema) {
  var typePaths = {
    [AppConstants.ObjectType.Member]: 'member',
    [AppConstants.ObjectType.Nest]: 'nest',
    [AppConstants.ObjectType.Pedigree]: 'pedigree'
  };

  _changeDocument(
    'Add custom field',
    _document.setIn(['schema', typePaths[objectType], field], Immutable.Map(schema))
  );
};


var _deleteField = function(objectType, field) {
  var pedigree = _document.pedigree;
  var schema = _document.schema;
  var symbol = _document.symbol;

  switch (objectType) {
    case AppConstants.ObjectType.Member:
      schema = schema.deleteIn(['member', field]);
      pedigree = pedigree.update(
        'members',
        members => members.map(
          member => member.deleteIn(['fields', field])
        )
      );
      symbol = symbol.update('mapping', mapping => mapping.map(
        mappedField => (mappedField === field) ? undefined : mappedField
      ));
      break;
    case AppConstants.ObjectType.Nest:
      schema = schema.deleteIn(['nest', field]);
      pedigree = pedigree.update(
        'nests',
        nests => nests.map(
          nest => nest.deleteIn(['fields', field])
        )
      );
      break;
    case AppConstants.ObjectType.Pedigree:
    default:
      schema = schema.deleteIn(['pedigree', field]);
      pedigree = pedigree.deleteIn(['fields', field]);
  }

  _changeDocument(
    'Remove custom field',
    _document.merge({
      pedigree: pedigree,
      schema: schema,
      symbol: symbol
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
      _addChild(action.nestKey, action.gender);
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
    case ActionTypes.UPDATE_FIELDS:
      _updateFields(action.objectRef, action.fields);
      break;
    case ActionTypes.ADD_FIELD:
      _addField(action.objectType, action.field, action.schema);
      break;
    case ActionTypes.DELETE_FIELD:
      _deleteField(action.objectType, action.field);
      break;
    default:
  }

  DocumentStore.emitChange();
});


module.exports = DocumentStore;
