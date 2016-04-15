var produce = 'json';


var writeJson = function(document) {
  return document.fields.merge({
    members: document.members,
    customMemberPropertySchemas: document.customMemberFieldSchemas
  }).toJS();
};


var writeString = function(document) {
  return JSON.stringify(writeJson(document), null, 2);
};


module.exports = {produce, writeJson, writeString};
