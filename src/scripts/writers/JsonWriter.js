var produce = 'json';


var writeJson = function(document) {
  return document.fields.merge({
    individuals: document.individuals,
    customIndividualPropertySchemas: document.customIndividualFieldSchemas
  }).toJS();
};


var writeString = function(document) {
  return JSON.stringify(writeJson(document), null, 2);
};


module.exports = {produce, writeJson, writeString};
