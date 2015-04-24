'use strict';

var React = require('react');

var AppConfig = require('../../constants/AppConfig');
var Symbol = require('../../common/Structures').Symbol;

var _full = AppConfig.MemberSize;
var _half = AppConfig.MemberSize / 2;

var _generatePermutations = function(n, letters) {
  var result = [];
  var prefixes;

  if (n <= 1) {
    return letters;
  } else {
    prefixes = _generatePermutations(n - 1, letters);
    prefixes.forEach(prefix => result = result.concat(letters.map(l => prefix + l)));
    return result;
  }
};

// Return a list of rect shapes.
var _getSymbolPattern = function(symbol) {

  var patternProps = [];

  switch (symbol.scheme) {
    case 0:
      patternProps.push({width: _full, height: _full});
      break;
    case 1:
      patternProps.push({width: _half, height: _full, x: 0, y: 0});
      patternProps.push({width: _half, height: _full, x: _half, y: 0});
      break;
    case 2:
      patternProps.push({width: _full, height: _half, x: 0, y: 0});
      patternProps.push({width: _full, height: _half, x: 0, y: _half});
      break;
    case 3:
      patternProps.push({width: _half, height: _full, x: 0, y: 0});
      patternProps.push({width: _half, height: _half, x: _half, y: 0});
      patternProps.push({width: _half, height: _half, x: _half, y: _half});
      break;
    case 4:
      patternProps.push({width: _half, height: _half, x: 0, y: 0});
      patternProps.push({width: _half, height: _half, x: 0, y: _half});
      patternProps.push({width: _half, height: _full, x: _half, y: 0});
      break;
    case 5:
      patternProps.push({width: _full, height: _half, x: 0, y: 0});
      patternProps.push({width: _half, height: _half, x: 0, y: _half});
      patternProps.push({width: _half, height: _half, x: _half, y: _half});
      break;
    case 6:
      patternProps.push({width: _half, height: _half, x: 0, y: 0});
      patternProps.push({width: _half, height: _half, x: _half, y: 0});
      patternProps.push({width: _full, height: _half, x: 0, y: _half});
      break;
    case 7:
      patternProps.push({width: _half, height: _half, x: 0, y: 0});
      patternProps.push({width: _half, height: _half, x: _half, y: 0});
      patternProps.push({width: _half, height: _half, x: 0, y: _half});
      patternProps.push({width: _half, height: _half, x: _half, y: _half});
      break;
  }

  // TODO: handle patterns like "solid", "vertical stripes", etc.
  return symbol.color
    .map((color, i) => <rect key={i} fill={color} {...patternProps[i]} />)
    .toArray();
};

var _getPatternDefs = function(symbol) {
  var symbolPattern = _getSymbolPattern(symbol);

  // do the permutation
  // var n = symbol.mapping.size;
  // var letters = ['0', '1'];
  var perms = _generatePermutations(symbol.mapping.size, ['0', '1'])
    .filter(perm => parseInt(perm, 2) > 0);

  return perms.map(perm => {
    return (
      <pattern key={'symbol-pattern-' + perm} id={'symbol-pattern-' + perm}
               width={_full} height={_full} strokeWidth="1"
               xmlns="http://www.w3.org/2000/svg" >
        {symbolPattern.filter((p, i) => perm[i] === '1')}
      </pattern>
    );
  });
};

var PedigreeDefs = React.createClass({

  propTypes: {
    symbol: React.PropTypes.instanceOf(Symbol).isRequired
  },

  shouldComponentUpdate: function(nextProps) {
    return nextProps.symbol !== this.props.symbol;
  },

  render: function() {
    console.log('generate svg defs for scheme.');

    // TODO: we need the key on the defs element to make sure defs are updated
    // as SVG elements.
    return (
      <defs key={'scheme-' + this.props.symbol.scheme}>
        {_getPatternDefs(this.props.symbol)}
      </defs>
    );
  }
});

module.exports = PedigreeDefs;
