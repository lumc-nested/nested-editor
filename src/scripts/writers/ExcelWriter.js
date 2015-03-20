'use strict';


var XLSX = require('xlsx');

var AppStore = require('../stores/AppStore');
var getFatherAndMother = require('../common/Utils').getFatherAndMother;


var produce = 'xlsx';
var binary = true;


// From https://github.com/SheetJS/js-xlsx#writing-workbooks
var datenum = function(v, date1904) {
  var epoch;

  if (date1904) {
    v += 1462;
  }
  epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
};


// From https://github.com/SheetJS/js-xlsx#writing-workbooks
var sheetFromArrayOfArrays = function(data) {
  var ws = {};
  var range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}};
  var cell;
  var cellRef;
  var C;
  var R;

  for (R = 0; R !== data.length; ++R) {
    for (C = 0; C !== data[R].length; ++C) {
      if (range.s.r > R) {
        range.s.r = R;
      }
      if (range.s.c > C) {
        range.s.c = C;
      }
      if (range.e.r < R) {
        range.e.r = R;
      }
      if (range.e.c < C) {
        range.e.c = C;
      }

      cell = {v: data[R][C]};

      if (cell.v === null) {
        continue;
      }

      cellRef = XLSX.utils.encode_cell({c: C, r: R});

      if (typeof cell.v === 'number') {
        cell.t = 'n';
      } else if (typeof cell.v === 'boolean') {
        cell.t = 'b';
      } else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      } else {
        cell.t = 's';
      }

      ws[cellRef] = cell;
    }
  }

  if (range.s.c < 10000000) {
    ws['!ref'] = XLSX.utils.encode_range(range);
  }

  return ws;
};


var flatten = function(document) {
  var flattened;
  var schema;

  // TODO: Perhaps it's not a good idea to query the AppStore from here.
  schema = document.schema.mergeDeep(AppStore.getSchema());

  flattened = document.pedigree.members
    .map((member, memberKey) => {
      var [father, mother] = getFatherAndMother(member.parents, document.pedigree.members);

      return [memberKey, father, mother].concat(
        schema.member.map((_, fieldKey) => member.fields.get(fieldKey)).toArray()
      );
    })
    .toArray();

  flattened.unshift(['ID', 'Father', 'Mother'].concat(
    schema.member.map(field => field.get('title')).toArray()
  ));

  return flattened;
};


var writeString = function(document) {
  var sheet;
  var workbook;

  function Workbook() {
    if (!(this instanceof Workbook)) {
      return new Workbook();
    }
    this.SheetNames = [];
    this.Sheets = {};
  }

  workbook = new Workbook();
  sheet = sheetFromArrayOfArrays(flatten(document));

  workbook.SheetNames.push('Sheet1');
  workbook.Sheets.Sheet1 = sheet;

  return XLSX.write(workbook, {bookType: 'xlsx', type: 'binary'});
};


module.exports = {produce, binary, writeString};
