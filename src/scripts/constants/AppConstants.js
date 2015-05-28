var Package = require('../../../package.json');


module.exports = Object.freeze({
  Version: Package.version,
  Gender: {
    Unknown: 0,
    Male: 1,
    Female: 2
  },
  ObjectType: {
    Pedigree: 0,
    Nest: 1,
    Pregnancy: 2,
    Member: 3,
    Symbol: 4
  },

  FillPattern: {
    Dotted: 'dotted',
    Horizontal: 'horizontal',
    Solid: 'solid',
    Vertical: 'vertical'
  }
});
