'use strict';

var AppDispatcher = require('../dispatchers/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var PedigreeConstants = require('../constants/PedigreeConstants');
var Immutable = require('immutable');
var _ = require('lodash');


var CHANGE_EVENT = 'change';

// TODO: at some point this shoudl be replaced by a call to backend sever.
// var _data = require('../../../examples/example.json');


var _pedigree, _focus, _ids;


// Returns an infinite Immutable.IndexedSeq of strings that are not in ids.
var _freeIds = function(ids) {
  return Immutable.Range(1).map(n => 'id_' + n.toString()).filterNot(id => ids.contains(id));
};


var _newId = function() {
  var id = _ids.first();
  _ids = _ids.rest();
  return id;
};


var _loadPedigree = function(pedigree) {
  // Where do we use Immutable and where do we convert to plain JS objects?
  // Current approach: use Immutable as much as possible in all stores and
  // components. Convert to plain JS objects for code unrelated to Flux and
  // third-party APIs.
  // Todo: Make both members and nests maps (keys id and father,mother).
  _pedigree = Immutable.fromJS(pedigree);
  _focus = undefined;
  _ids = _freeIds(_pedigree.get('members').map(m => m.get('_id')));
};

var _addSpouse = function() {
  var id;
  var other;
  var nest;
  var gender;

  if (_focus !== undefined && _focus.get('level') === PedigreeConstants.FocusLevel.Member) {
    id = _newId();
    other = _pedigree.get('members').find(m => m.get('_id') === _focus.get('key'));
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

    _pedigree = _pedigree.update('members', ms => ms.push(Immutable.Map({
      _id: id,
      gender: gender
    }))).update('nests', ns => ns.push(nest));

    // simulating immutable data here to trigger re-layout.
    // TODO: do it with real immutable data.
    // _pedigree = _.clone(_pedigree);
  }
};

var _addChild = function(gender) {
  var id;
  var child;
  var pregnancy;

  // TODO: how to arrange children order?

  if (_focus !== undefined && _focus.get('level') === PedigreeConstants.FocusLevel.Nest) {
    id = _newId();
    child = Immutable.Map({_id: id, gender: gender});
    pregnancy = Immutable.Map({
      'zygotes': Immutable.List.of(id)
    });

    _pedigree = _pedigree.update('nests', ns => {
      return ns.map(n => {
        if (n.get('father') === _focus.getIn(['key', 'father']) &&
            n.get('mother') === _focus.getIn(['key', 'mother'])) {
          return n.update('pregnancies', ps => ps.push(pregnancy));
        } else {
          return n;
        }
      });
    }).update('members', ms => ms.push(child));

    // simulating immutable data here to trigger re-layout.
    // TODO: do it with real immutable data.
    // _pedigree = _.clone(_pedigree);
  }
};

var _updateMember = function(data) {
  if (_focus !== undefined && _focus.get('level') === PedigreeConstants.FocusLevel.Member) {
    _pedigree = _pedigree.update('members', ms => {
      return ms.map(m => {
        if (m.get('_id') === _focus.get('key')) {
          // Todo: Make sure we're not introducing some nested mutable
          //   data here.
          return m.merge(data);
        } else {
          return m;
        }
      });
    });
  }

  // simulating immutable data here to trigger re-layout.
  // TODO: do it with real immutable data.
  // _pedigree = _.clone(_pedigree);
};


var AppStore = _.extend(EventEmitter.prototype, {
  getData: function() {
    return {
      'pedigree': _pedigree,
      'focus': _focus
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
      _focus = Immutable.fromJS(action.focus);
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
