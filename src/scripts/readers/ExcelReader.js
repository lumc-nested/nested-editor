'use strict';


var Immutable = require('immutable');
var XLSX = require('xlsx');

var Structures = require('../common/Structures');


var Document = Structures.Document;
var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;
var Pregnancy = Structures.Pregnancy;


var accept = ['xlsx', 'ods'];
var binary = true;


var readWorkbook = function(workbook) {
  var members;
  var mergeNests;
  var nests;
  var originalMembers;
  var pedigree;
  var schemaExtension;
  var sheet;
  var singletonNest;
  var singletonNestMap;

  sheet = workbook.Sheets[workbook.SheetNames[0]];

  // For now, we expect a sheet in exactly the format (including column
  // headers) as in the examples/example.xlsx file.
  originalMembers = Immutable.fromJS(XLSX.utils.sheet_to_json(sheet));

  // Map of strings (member keys) to Maps (member fields).
  members = originalMembers
    .toMap()
    .mapEntries(([_, member]) => {
      console.log('name', typeof member.get('Gender'), member.get('Name'));
      return [member.get('ID'),
              Immutable.Map({
                gender: parseInt(member.get('Gender'), 10),
                name: member.get('Name')
              })];
    });

  // Nest of one child with given key.
  singletonNest = key => {
    var pregnancy = new Pregnancy({zygotes: Immutable.List.of(key)});
    return new Nest({pregnancies: Immutable.List.of(pregnancy)});
  };

  // Map of one singleton nest for the given member, indexed by the parent keys.
  singletonNestMap = member => Immutable.Map([
    [Immutable.Set.of(member.get('FatherID'), member.get('MotherID')),
     singletonNest(member.get('ID'))]
  ]);

  // Combine pregnancies from two nests.
  mergeNests = (nestA, nestB) => new Nest({
    pregnancies: nestA.pregnancies.concat(nestB.pregnancies)
  });

  // Create a singleton nest for each member that we know both parents of,
  // index these nests by their parents and merge any duplicates.
  nests = originalMembers
    .filter(member => members.has(member.get('FatherID')) && members.has(member.get('MotherID')))
    .toMap()
    .reduce((nests, member) => nests.mergeWith(mergeNests, singletonNestMap(member)),
            Immutable.Map());

  pedigree = new Pedigree({
    members,
    nests,
    fields: Immutable.Map({note: 'Imported from Excel'})
  });

  schemaExtension = Immutable.fromJS({
    definitions: {
      member: {
        properties: {
          name: {
            title: 'Name',
            type: 'string'
          }
        }
      },
      pedigree: {
        properties: {
          note: {
            title: 'Note',
            type: 'string'
          }
        }
      }
    }
  });

  return new Document({pedigree, schemaExtension});
};


var readString = function(string) {
  return readWorkbook(XLSX.read(string, {type: 'binary'}));
};


module.exports = {accept, binary, readWorkbook, readString};
