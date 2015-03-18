'use strict';


var getFatherAndMother = require('../common/Utils').getFatherAndMother;


var produce = 'ped';


var flatten = function(document) {
  return document.pedigree.members
    .map((member, memberKey) => {
      var [father, mother] = getFatherAndMother(member.parents, document.pedigree.members);
      return [
        member.fields.get('family', 'default'),
        memberKey,
        father || 0,
        mother || 0,
        member.fields.get('gender'),
        2
      ];
    })
    .toArray();
};


var writeString = function(document) {
  return '# Exported from Pedigree Webapp\n' +
    flatten(document).map(line => line.join('\t')).join('\n') + '\n';
};


module.exports = {produce, writeString};
