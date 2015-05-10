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
    member.ID.toString(),
    new Member({fields: Immutable.Map({
      surname: member.SURNAME,
      forenames: member.FORENAMES,
      gender: mapGender(member.SEX)
    })})
  ]));

  nests = Immutable.Map(parser.getRelationships().map(relationship => [
    Immutable.Set.of(
      relationship.MEMBER_1_ID.toString(),
      relationship.MEMBER_2_ID.toString()
    ),
    new Nest({
      consanguineous: relationship.RELATION_IS_CONSANGUINEOUS
    })
  ]));

  parser.getMembers().forEach(member => {
    var fatherId = member.FATHER_ID.toString();
    var motherId = member.MOTHER_ID.toString();
    var nestKey;
    if (members.has(fatherId) && members.has(fatherId)) {
      nestKey = Immutable.Set.of(fatherId, motherId);
      nests = nests.updateIn([nestKey, 'pregnancies'], pregnancies => pregnancies.push(
        new Pregnancy({children: Immutable.List.of(member.ID.toString())})
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
