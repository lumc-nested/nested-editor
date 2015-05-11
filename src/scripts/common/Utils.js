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


module.exports = {getFatherAndMother};
