var produce = 'json';


var writeJson = function(document) {
  var members = document.pedigree.members.map(member => member.fields);
  var nests = document.pedigree.nests.mapEntries(
    ([nestKey, nest]) => [
      nestKey.join(','),
      nest.fields.set('pregnancies', nest.pregnancies.map(
        pregnancy => pregnancy.fields.merge({
          children: pregnancy.children,
          zygotes: pregnancy.zygotes
        })
      ))
    ]
  );
  var pedigree = document.pedigree.fields.merge({
    members: members.toJS(),
    nests: nests.toJS()
  });

  return {
    // TODO: Symbol.
    pedigree: pedigree,
    schemaExtension: {
      $schema: 'http://json-schema.org/draft-04/schema#',
      definitions: {
        pedigree: {
          properties: document.schema.pedigree.toJS()
        },
        member: {
          properties: document.schema.member.toJS()
        },
        nest: {
          properties: document.schema.nest.toJS()
        },
        pregnancy: {
          properties: document.schema.pregnancy.toJS()
        }
      }
    }
  };
};


var writeString = function(document) {
  return JSON.stringify(writeJson(document), null, 2);
};


module.exports = {produce, writeJson, writeString};
