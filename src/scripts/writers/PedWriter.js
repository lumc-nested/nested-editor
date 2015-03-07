'use strict';


var AppConstants = require('../constants/AppConstants');


var flatten = function(document) {
  var fathers = {};
  var mothers = {};

  document.pedigree.nests.forEach((nest, nestKey) => {
    var [father, mother] = nestKey.toArray();

    if (document.pedigree.members.get(father).get('gender') === AppConstants.Gender.Female ||
        document.pedigree.members.get(mother).get('gender') === AppConstants.Gender.Male) {
      [father, mother] = [mother, father];
    }

    nest.pregnancies.flatMap(pregnancy => pregnancy.zygotes).forEach(zygote => {
      fathers[zygote] = father;
      mothers[zygote] = mother;
    });
  });

  return document.pedigree.members
    .map((member, memberKey) => [
      member.get('family', 'default'),
      memberKey,
      fathers[memberKey] || 0,
      mothers[memberKey] || 0,
      member.get('gender'),
      2
    ])
    .toArray();
};


var writeString = function(document) {
  return '# Exported from Pedigree Webapp\n' +
    flatten(document).map(line => line.join('\t')).join('\n') + '\n';
};


module.exports = {writeString};
