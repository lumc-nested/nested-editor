var populateParents = function(members, nests) {
  nests.forEach((nest, nestKey) => {
    nest.pregnancies.forEach(pregnancy => {
      pregnancy.children.forEach(childKey => {
        members = members.update(childKey,
          member => member.set('parents', nestKey));
      });
    });
  });

  return members;
};

module.exports = {populateParents};
