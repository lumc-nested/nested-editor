'use strict';


var populateParents = function(members, nests) {
  nests.forEach((nest, nestKey) => {
    nest.pregnancies.forEach(pregnancy => {
      pregnancy.zygotes.forEach(zygote => {
        members = members.update(zygote,
          member => member.set('parents', nestKey));
      });
    });
  });

  return members;
};

module.exports = {populateParents};
