'use strict';


var Immutable = require('immutable');
var XLSX = require('xlsx');

var AppConstants = require('../constants/AppConstants');
var Structures = require('../common/Structures');


var Document = Structures.Document;
var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;
var Pregnancy = Structures.Pregnancy;
var Schema = Structures.Schema;


var accept = ['xlsx', 'ods'];
var binary = true;


// Convert some value to a boolean.
var convertBoolean = function(value) {
  switch (value.toString().toLowerCase()) {
    case 'yes':
    case 'true':
    case 'on':
      return true;
    case 'no':
    case 'false':
    case 'off':
      return false;
    default:
      return Boolean(value);
  }
};


// We try to map columns to our predefined member fields (and structural
// properties key, father, mother). Aliases must be in lower case.
var mappers = {
  key: {
    aliases: ['id',
              'member', 'memberid', 'member_id', 'member id',
              'person', 'personid', 'person_id', 'person id'],
    convert: value => value.toString()
  },

  father: {
    aliases: ['fatherid', 'father_id', 'father id'],
    convert: value => value.toString()
  },

  mother: {
    aliases: ['motherid', 'mother_id', 'mother id'],
    convert: value => value.toString()
  },

  gender: {
    aliases: ['sex'],
    convert: value => {
      switch (value.toString().toLowerCase()) {
        case 'male':
        case '1':
          return AppConstants.Gender.Male;
        case 'female':
        case '2':
          return AppConstants.Gender.Female;
        default:
          return AppConstants.Gender.Unknown;
      }
    }
  },

  proband: {
    aliases: [],
    convert: convertBoolean
  },

  consultand: {
    aliases: [],
    convert: convertBoolean
  },

  dateOfBirth: {
    aliases: ['birthDate'],
    convert: value => value.toString()
  },

  dateOfDeath: {
    aliases: ['deathDate'],
    convert: value => value.toString()
  },

  deceased: {
    aliases: ['dead', 'died'],
    convert: convertBoolean
  }
};


// Get an array of column names from the header row.
var getColumnNames = function(sheet) {
  var range = XLSX.utils.decode_range(sheet['!ref']);
  var row = XLSX.utils.encode_row(range.s.r);
  var names = [];
  var column;
  var value;

  for (column = range.s.c; column <= range.e.c; ++column) {
    value = sheet[XLSX.utils.encode_col(column) + row];
    if (value !== undefined) {
      names.push(XLSX.utils.format_cell(value));
    }
  }

  return names;
};


var readWorkbook = function(workbook) {
  var columns;
  var getters;
  var mappedColumns;
  var members;
  var mergeNests;
  var nests;
  var originalMembers;
  var pedigree;
  var schema;
  var sheet;
  var singletonNest;
  var singletonNestMap;

  sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Array of column names.
  columns = getColumnNames(sheet);

  // Array of column names we mapped to predefined member fields.
  mappedColumns = [];

  // For each mapped column name, a getter function yielding the corresponding
  // field value. Indexed by the field key.
  getters = {};

  // Populate `mappedColumns` and `getters`.
  Object.keys(mappers).forEach(key => {
    var columnsLower = columns.map(column => column.toLowerCase());
    var mapper = mappers[key];

    [key].concat(mapper.aliases).forEach(alias => {
      var index = columnsLower.indexOf(alias);
      var column;

      if (index !== -1) {
        column = columns[index];
        mappedColumns.push(column);
        getters[key] = member => {
          var value = member.get(column);
          return value === undefined ? value : mapper.convert(value, alias);
        };
      }
    });
  });

  // TODO: Somehow keep track of column mappings so that we could use the
  //   original column names on export to Excel. Ideally, we could even export
  //   to the original column value (needs sort of the inverse of the convert
  //   functions).

  // Per member, a map of strings (column names) to values.
  originalMembers = Immutable.fromJS(XLSX.utils.sheet_to_json(sheet));

  // We should always have a 'key' getter, so if we couldn't find it we
  // generate keys ourselves.
  if (!getters.hasOwnProperty('key')) {
    originalMembers = originalMembers.map(
      (member, index) => member.set('_key', index.toString())
    );
    mappedColumns.push('_key');
    getters.key = member => member.get('_key');
  }

  // Map of strings (member keys) to Maps (member fields).
  // We first get the values for mapped columns using `getters` and then add
  // the remaining columns as strings.
  // TODO: Do we want to lowercase the unmapped column keys (and remove
  //   whitespace)? We should probably take the same approach as we will in
  //   the custom field editor (which has not be implemented at this point).
  // TODO: Instead of assuming unmapped columns are strings, try to infer the
  //   type.
  members = originalMembers
    .toMap()
    .mapEntries(([, member]) => [
      getters.key(member),
      Immutable.Map(getters)
        .delete('key')
        .delete('father')
        .delete('mother')
        .map(getter => getter(member))
        .merge(
          Immutable.Map(member)
            .filter((_, key) => mappedColumns.indexOf(key) === -1)
            .map(value => value === undefined ? value : value.toString())
        )
    ]);

  // Nest of one child with given key.
  singletonNest = key => {
    var pregnancy = new Pregnancy({zygotes: Immutable.List.of(key)});
    return new Nest({pregnancies: Immutable.List.of(pregnancy)});
  };

  // Map of one singleton nest for the given member, indexed by the parent keys.
  singletonNestMap = member => Immutable.Map([
    [Immutable.Set.of(getters.father(member), getters.mother(member)),
     singletonNest(getters.key(member))]
  ]);

  // Combine pregnancies from two nests.
  mergeNests = (nestA, nestB) => new Nest({
    pregnancies: nestA.pregnancies.concat(nestB.pregnancies)
  });

  // Create a singleton nest for each member that we know both parents of,
  // index these nests by their parents and merge any duplicates.
  nests = originalMembers
    .filter(member => members.has(getters.father(member)) && members.has(getters.mother(member)))
    .toMap()
    .reduce((nests, member) => nests.mergeWith(mergeNests, singletonNestMap(member)),
            Immutable.Map());

  pedigree = new Pedigree({
    members,
    nests,
    fields: Immutable.Map({note: 'Imported from Excel'})
  });

  // We include custom field definitions for all columns we could not map (for
  // now all as type string).
  schema = new Schema({
    pedigree: Immutable.fromJS({
      note: {
        title: 'Note',
        type: 'string'
      }
    }),
    member: Immutable.List(columns)
      .filterNot(column => mappedColumns.includes(column))
      .toMap()
      .mapEntries(([, column]) => [
        column,
        Immutable.Map({title: column, type: 'string'})
      ])
  });

  return new Document({pedigree, schema});
};


var readString = function(string) {
  return readWorkbook(XLSX.read(string, {type: 'binary'}));
};


module.exports = {accept, binary, readWorkbook, readString};
