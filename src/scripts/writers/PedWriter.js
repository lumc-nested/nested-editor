var produce = 'ped';


var flatten = function(document) {
  return document.members
    .map((member, memberKey) => {
      return [
        member.get('family', 'default'),
        memberKey,
        member.get('father', 0),
        member.get('mother', 0),
        member.get('gender'),
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
