var Immutable = require('immutable');
var XLSX = require('xlsx');

var {Document} = require('../common/Structures');


var accept = ['xlsx', 'ods'];
var binary = true;


// Convert some value to a boolean.
var convertBoolean = function(value) {
  switch (value.toString().toLowerCase()) {
    case 'yes':
    case 'true':
    case 'on':
    case '1':
      return true;
    case 'no':
    case 'false':
    case 'off':
    case '.':
    case '0':
      return false;
    default:
      return Boolean(value);
  }
};


// We try to map columns to our predefined individual fields (and structural
// properties key, father, mother). Aliases must be in lower case.
var mappers = {
  key: {
    aliases: ['id',
              'member', 'memberid', 'member_id', 'member id',
              'person', 'personid', 'person_id', 'person id',
              'individual', 'individualid', 'individual_id', 'individual id'],
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
        case 'm':
        case '1':
          return 'male';
        case 'female':
        case 'f':
        case '2':
          return 'female';
        default:
          return 'unknown';
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
  var customIndividualFieldSchemas;
  var fields;
  var getters;
  var mappedColumns;
  var individuals;
  var originalIndividuals;
  var sheet;

  sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Array of column names.
  columns = getColumnNames(sheet);

  // Array of column names we mapped to predefined individual fields.
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
        getters[key] = individual => {
          var value = individual.get(column);
          return value === undefined ? value : mapper.convert(value, alias);
        };
      }
    });
  });

  // TODO: Somehow keep track of column mappings so that we could use the
  //   original column names on export to Excel. Ideally, we could even export
  //   to the original column value (needs sort of the inverse of the convert
  //   functions).

  // Per individual, a map of strings (column names) to values.
  originalIndividuals = Immutable.fromJS(XLSX.utils.sheet_to_json(sheet));

  // TODO: Our app currently does not handle unconnected pedigrees well. We
  //   should at least implement a warning for the user. This would apply to
  //   all readers, not just ExcelReader.
  if (!['key', 'father', 'mother'].every(key => getters.hasOwnProperty(key))) {
    console.log('WARNING: Could not infer relationship definitions from Excel file');
  }

  // We should always have a 'key' getter, so if we couldn't find it we
  // generate keys ourselves.
  if (!getters.hasOwnProperty('key')) {
    originalIndividuals = originalIndividuals.map(
      (individual, index) => individual.set('_key', index.toString())
    );
    mappedColumns.push('_key');
    getters.key = individual => individual.get('_key');
  }

  // Map of strings (individual keys) to Maps (individual fields).
  // We first get the values for mapped columns using `getters` and then add
  // the remaining columns as strings.
  // TODO: Do we want to lowercase the unmapped column keys (and remove
  //   whitespace)? We should probably take the same approach as we will in
  //   the custom field editor (which has not be implemented at this point).
  // TODO: Instead of assuming unmapped columns are strings, try to infer the
  //   type.
  individuals = originalIndividuals
    .toMap()
    .mapEntries(([, individual]) => [
      getters.key(individual),
      Immutable.Map(getters)
        .delete('key')
        .map(getter => getter(individual))
        .merge(
          Immutable.Map(individual)
            .filter((_, key) => mappedColumns.indexOf(key) === -1)
            .map(value => value === undefined ? value : value.toString())
        )
    ]);

  fields = Immutable.Map({title: 'Imported from Excel'});

  // We include custom field definitions for all columns we could not map (for
  // now all as type string).
  customIndividualFieldSchemas = Immutable.List(columns)
    .filterNot(column => mappedColumns.includes(column))
    .toMap()
    .mapEntries(([, column]) => [
      column,
      Immutable.Map({title: column, type: 'string'})
    ]);

  return new Document({individuals, fields, customIndividualFieldSchemas});
};


var readString = function(string) {
  return readWorkbook(XLSX.read(string, {type: 'binary'}));
};


module.exports = {accept, binary, readWorkbook, readString};
