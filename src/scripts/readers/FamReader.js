'use strict';


var Immutable = require('immutable');

var AppConstants = require('../constants/AppConstants');
var Structures = require('../common/Structures');
var Utils = require('./Utils');

var FamParser = require('fam-parser');


var Document = Structures.Document;
var Member = Structures.Member;
var Nest = Structures.Nest;
var Pedigree = Structures.Pedigree;
var Pregnancy = Structures.Pregnancy;
var Schema = Structures.Schema;


var accept = ['fam'];
var binary = true;


var mapGender = function(gender) {
  if (gender === 'MALE') {
    return AppConstants.Gender.Male;
  } else if (gender === 'FEMALE') {
    return AppConstants.Gender.Female;
  }
  return AppConstants.Gender.Unknown;
};


var readString = function(string) {
  var members;
  var nests;
  var parser;
  var pedigree;
  var schema;

  parser = new FamParser(string);

  members = Immutable.Map(parser.getMembers().map(member => [
    member.ID,
    new Member({fields: Immutable.Map({
      surname: member.SURNAME,
      forenames: member.FORENAMES,
      gender: mapGender(member.SEX)
    })})
  ]));

  nests = Immutable.Map(parser.getRelationships().map(relationship => [
    Immutable.Set.of(relationship.MEMBER_1_ID, relationship.MEMBER_2_ID),
    new Nest({
      consanguineous: relationship.RELATION_IS_CONSANGUINEOUS
    })
  ]));

  parser.getMembers().forEach(member => {
    var nestKey;
    if (members.has(member.MOTHER_ID) && members.has(member.FATHER_ID)) {
      nestKey = Immutable.Set.of(member.MOTHER_ID, member.FATHER_ID);
      nests = nests.updateIn([nestKey, 'pregnancies'], pregnancies => pregnancies.push(
        new Pregnancy({children: Immutable.List.of(member.ID)})
      ));
    }
  });

  // Add parents key to member instances.
  members = Utils.populateParents(members, nests);

  pedigree = new Pedigree({
    members,
    nests,
    fields: Immutable.Map({note: 'Imported from FAM'})
  });

  schema = new Schema({
    pedigree: Immutable.fromJS({
      note: {
        title: 'Note',
        type: 'string'
      }
    }),
    member: Immutable.fromJS({
      surname: {
        title: 'Surname',
        type: 'string'
      },
      forename: {
        title: 'Forename',
        type: 'string'
      }
    })
  });

  return new Document({pedigree, schema});
};


module.exports = {accept, binary, readString};
