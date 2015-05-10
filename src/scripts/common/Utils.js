var AppConstants = require('../constants/AppConstants');


var getFatherAndMother = function(nestKey, members) {
  var [father, mother] = [undefined, undefined];

  if (nestKey) {
    [father, mother] = nestKey.toArray();
  }

  // do our best to figure out which one is the father
  if (members.getIn([father, 'fields', 'gender']) === AppConstants.Gender.Female ||
      members.getIn([mother, 'fields', 'gender']) === AppConstants.Gender.Male) {
    [father, mother] = [mother, father];
  }

  return [father, mother];
};


var getSpouses = function(memberKey, nests) {
  return nests.keySeq()
    .filter(nestKey => nestKey.contains(memberKey) && nestKey.size === 2)
    .map(nestKey => nestKey.delete(memberKey).first())
    .toArray();
};


var memberAsString = function(memberKey, members) {
  var member = members.get(memberKey);
  return member.fields.get('name') || memberKey;
};


module.exports = {getFatherAndMother, getSpouses, memberAsString};
