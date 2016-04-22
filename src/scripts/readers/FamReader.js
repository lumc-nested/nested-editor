var Immutable = require('immutable');
var moment = require('moment');
var FamParser = require('fam-parser');

var {Document} = require('../common/Structures');


var accept = ['fam'];
var binary = true;


var parseGender = function(gender) {
  if (gender === 'MALE') {
    return 'male';
  } else if (gender === 'FEMALE') {
    return 'female';
  }
  return 'unknown';
};


var parseProband = function(proband) {
  // The actual value encodes the location of the proband sign (e.g.,
  // `BELOW_LEFT`), but we discard that.
  return proband && proband !== 'NOT_A_PROBAND';
};


var parseDate = function(date) {
  if (date === 'UNKNOWN' || date === 'DEFINED') {
    return undefined;
  }
  date = moment(date, 'YYYYDDD');
  if (date.isValid()) {
    return date.format('YYYY-MM-DD');
  } else {
    return undefined;
  }
};


var createZygotes = function(twinStatus, n) {
  if (twinStatus === 'MONOZYGOUS') {
    return Immutable.Repeat(0).take(n).toList();
  } else if (twinStatus === 'DIZYGOUS') {
    return Immutable.Range().take(n).toList();
  }

  return undefined;
};


var readString = function(string) {
  /**
   * TODO: Interpret symbol scheme. The metadata has the following fields (with
   * example values):
   *
   * - DESC_00: Clear symbol
   * - DESC_01: Unaffected
   * - DESC_02: Affected
   * - DESC_03: Carrier
   * - DESC_04: Possibly affected
   * - DESC_05: q1
   * - DESC_06: q2
   * - DESC_07: q3
   * - DESC_08: q4
   * - DESC_09: Heterozygous
   * - DESC_10: q1 + q3
   * - DESC_11: q1 + q4
   * - DESC_12: q2 + q3
   * - DESC_13: q2 + q4
   * - DESC_14: q3 + q4
   * - DESC_15: q1 + q2 + q3
   * - DESC_16: q1 + q2 + q4
   * - DESC_17: q1 + q3 + q4
   * - DESC_18: q2 + q3 + q4
   * - DESC_19: Cross symbol
   * - DESC_20: Plus symbol
   * - DESC_21: Minus symbol
   * - DESC_22: "O" symbol
   *
   * The metadata also has a number of the following pairs, counted by the
   * NUMBER_OF_CUSTOM_DESC field:
   *
   * - CUSTOM_DESC_*: custom symbol
   * - CUSTOM_CHAR_*: AA
   *
   * In addition, members have the following fields to index them:
   *
   * - DESCRIPTION_1: DESC_21
   * - DESCRIPTION_2: DESC_00
   */
  var individuals;
  var metadata;
  var nests;
  var parser;
  var pedigree;
  var schema;
  var texts;

  parser = new FamParser(string);

  metadata = parser.getMetadata();
  texts = parser.getTexts().filter(text => text.TEXT);

  individuals = Immutable.Map(parser.getMembers().map(member => [
    member.ID.toString(),
    Immutable.Map({
      /**
       * TODO: The following fields are discarded:
       *
       * - INDIVIDUAL_ID (?)
       * - INTERNAL_ID (integer)
       * - PEDIGREE_NUMBER (integer)
       * - UNKNOWN_TEXT (string)
       */
      annotation1: member.ANNOTATION_1,
      annotation2: member.ANNOTATION_2,
      cardinality: member.NUMBER_OF_INDIVIDUALS,
      comment: member.COMMENT,
      dateOfBirth: parseDate(member.DATE_OF_BIRTH),
      dateOfDeath: parseDate(member.DATE_OF_DEATH),
      deceased: member.DATE_OF_DEATH === 'DEFINED',
      forenames: member.FORENAMES,
      gender: parseGender(member.SEX),
      gestationalAge: member.AGE_GESTATION,
      maidenName: member.MAIDEN_NAME,
      proband: parseProband(member.PROBAND),
      surname: member.SURNAME
    }).filter(value => value !== undefined)
  ]));

  parser.getRelationships().filter(
    relationship =>
      individuals.has(relationship.MEMBER_1_ID.toString()) &&
      individuals.has(relationship.MEMBER_2_ID.toString())
  ).foreach(relationship => {
    console.log(relationship);
    /*
    Immutable.Set.of(
      relationship.MEMBER_1_ID.toString(),
      relationship.MEMBER_2_ID.toString()
    ),
    new Nest({fields: Immutable.Map({
      // TODO: The following fields are discarded:
      // - relationship.RELATION_NAME (string)
      consanguineous: relationship.CONSANGUINEOUS,
      divorced: relationship.DIVORCED,
      informal: relationship.INFORMAL,
      separated: relationship.SEPARATED
  }).filter(value => value !== undefined)})
    */
  });

  /**
   * Populate nests with pregnancies.
   *
   * Twins are encoded a bit weird in the FAM format. The first child in a
   * pregnancy has a TWIN_ID pointing to the second. All other children in the
   * pregnancy have a TWIN_ID pointing to the first.
   *
   * For example, a quintuplet looks like this;
   *
   *   A -> B
   *   B -> A
   *   C -> A
   *   D -> A
   *   E -> A
   *
   * The TWIN_STATUS field defines zygosity, but only for pairs. For triplets
   * and up, TWIN_STATUS contains the number of children.
   *
   * Our strategy (probably suboptimal) is to go over all members. For each
   * member we find its pregnancy instance and add the member to it if it
   * isn't already (it might not be, but we could still find it via TWIN_ID).
   * If there's no pregnancy instance yet, we create it and add both the
   * member and TWIN_ID (if set) to it.
   *
   * TODO: Order of pregnancies and order of children.
   */
  parser.getMembers().forEach(member => {
    var memberKey = member.ID.toString();
    var twinKey = member.TWIN_ID.toString();
    var fatherKey = member.FATHER_ID.toString();
    var motherKey = member.MOTHER_ID.toString();
    var nestKey = Immutable.Set.of(fatherKey, motherKey);

    if (nests.has(nestKey)) {
      nests = nests.updateIn([nestKey, 'pregnancies'], pregnancies => {
        var children = members.has(twinKey) ? Immutable.List.of(memberKey, twinKey) : Immutable.List.of(memberKey);
        var pregnancyIndex = pregnancies.findIndex(
          pregnancy => pregnancy.children.contains(memberKey) || pregnancy.children.contains(twinKey)
        );
        var zygotes;

        if (pregnancyIndex === -1) {
          zygotes = createZygotes(member.TWIN_STATUS, children.size);
          return pregnancies.push(new Pregnancy({children, zygotes}));
        } else {
          return pregnancies.update(pregnancyIndex, pregnancy => {
            children = pregnancy.get('children').toSet().union(children).toList();
            zygotes = createZygotes(member.TWIN_STATUS, children.size);
            return pregnancy.merge({children, zygotes});
          });
        }
      });
    }
  });

  // Add parents key to member instances.
  members = Utils.populateParents(members, nests);

  pedigree = new Pedigree({
    members,
    nests,
    fields: Immutable.Map({
      /**
       * TODO: The following fields are discarded:
       *
       * - NUMBER_OF_UNKNOWN_DATA (integer) counter for UNKNOWN_DATA_*
       * - UNKNOWN_1 (string)
       * - UNKNOWN_2 (string)
       * - UNKNOWN_DATA_* (string)
       */

      // TODO: Move these to document-level metadata.
      author: metadata.AUTHOR,
      created: parseDate(metadata.DATE_CREATED),
      updated: parseDate(metadata.DATE_UPDATED),
      source: `Imported from ${metadata.SOURCE} by Nested ${AppConstants.Version}`,

      comment: metadata.COMMENT,
      familyId: metadata.FAMILY_ID,
      familyName: metadata.FAMILY_NAME
    }).merge(
      // Add a field for every free text field (text1, text2, ...).
      Immutable.Map(texts.map((text, index) => ['text' + (index + 1), text.TEXT]))
    ).filter(value => value !== undefined)
  });

  schema = new Schema({
    pedigree: Immutable.fromJS({
      author: {
        title: 'Author',
        type: 'string'
      },
      comment: {
        title: 'Comment',
        type: 'string'
      },
      created: {
        title: 'Created',
        type: 'string',
        format: 'date'
      },
      updated: {
        title: 'Updated',
        type: 'string',
        format: 'date'
      },
      familyId: {
        title: 'Family ID',
        type: 'string'
      },
      familyName: {
        title: 'Family name',
        type: 'string'
      },
      source: {
        title: 'Source',
        type: 'string'
      }
    }).filter(
      // Only add schemas for fields that are actually populated.
      (_, field) => pedigree.fields.get(field)
    ).merge(Immutable.Map(
      // Add a field for every free text field (text1, text2, ...).
      texts.map((_, index) => [
        'text' + (index + 1),
        Immutable.Map({
          title: 'Text ' + (index + 1),
          type: 'string',
          format: 'multiline'
        })
      ])
    )),
    nest: Immutable.fromJS({
      divorced: {
        title: 'Divorced',
        type: 'boolean'
      },
      informal: {
        title: 'Informal relationship',
        type: 'boolean'
      },
      separated: {
        title: 'Separated',
        type: 'boolean'
      }
    }).filter(
      // Only add schemas for fields that are actually populated.
      (_, field) => nests.some(nest => nest.fields.get(field))
    ),
    member: Immutable.fromJS({
      annotation1: {
        title: 'Annotation 1',
        type: 'string'
      },
      annotation2: {
        title: 'Annotation 2',
        type: 'string'
      },
      cardinality: {
        title: 'Number of individuals',
        type: 'integer'
      },
      comment: {
        title: 'Comment',
        type: 'string',
        format: 'multiline'
      },
      forenames: {
        title: 'Forenames',
        type: 'string'
      },
      gestationalAge: {
        title: 'Gestational age',
        type: 'string'
      },
      individualId: {
        title: 'Individual ID',
        type: 'string'
      },
      maidenName: {
        title: 'Maiden name',
        type: 'string'
      },
      surname: {
        title: 'Surname',
        type: 'string'
      }
    }).filter(
      // Only add schemas for fields that are actually populated.
      (_, field) => members.some(member => member.fields.get(field))
    )
  });

  return new Document({pedigree, schema});
};


module.exports = {accept, binary, readString};
