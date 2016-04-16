var produce = 'ped';


var flatten = function(document) {
  return document.individuals
    .map((individual, individualKey) => {
      return [
        individual.get('family', 'default'),
        individualKey,
        individual.get('father', 0),
        individual.get('mother', 0),
        individual.get('gender'),
        2
      ];
    })
    .toArray();
};


var writeString = function(document) {
  return '# Exported from Nested\n' +
    flatten(document).map(line => line.join('\t')).join('\n') + '\n';
};


module.exports = {produce, writeString};
