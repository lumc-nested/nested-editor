'use strict';

var React = require('react');

var AppConfig = require('../../constants/AppConfig');
var AppConstants = require('../../constants/AppConstants');
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
      // left
      patternProps.push({width: _half, height: _full, x: 0, y: 0});
      // right
      patternProps.push({width: _half, height: _full, x: _half, y: 0});
      break;
    case 2:
      // top
      patternProps.push({width: _full, height: _half, x: 0, y: 0});
      // bottom
      patternProps.push({width: _full, height: _half, x: 0, y: _half});
      break;
    case 3:
      // left
      patternProps.push({width: _half, height: _full, x: 0, y: 0});
      // top right
      patternProps.push({width: _half, height: _half, x: _half, y: 0});
      // bottom right
      patternProps.push({width: _half, height: _half, x: _half, y: _half});
      break;
    case 4:
      // top left
      patternProps.push({width: _half, height: _half, x: 0, y: 0});
      // bottom left
      patternProps.push({width: _half, height: _half, x: 0, y: _half});
      // right
      patternProps.push({width: _half, height: _full, x: _half, y: 0});
      break;
    case 5:
      // top
      patternProps.push({width: _full, height: _half, x: 0, y: 0});
      // bottom left
      patternProps.push({width: _half, height: _half, x: 0, y: _half});
      // bottom right
      patternProps.push({width: _half, height: _half, x: _half, y: _half});
      break;
    case 6:
      // top left
      patternProps.push({width: _half, height: _half, x: 0, y: 0});
      // top right
      patternProps.push({width: _half, height: _half, x: _half, y: 0});
      // bottom
      patternProps.push({width: _full, height: _half, x: 0, y: _half});
      break;
    case 7:
      // top left
      patternProps.push({width: _half, height: _half, x: 0, y: 0});
      // top right
      patternProps.push({width: _half, height: _half, x: _half, y: 0});
      // bottom left
      patternProps.push({width: _half, height: _half, x: 0, y: _half});
      // bottom right
      patternProps.push({width: _half, height: _half, x: _half, y: _half});
      break;
  }

  return patternProps
    .map((props, i) => <rect key={i} fill={'url(#fill-' + i + ')'} {...props} />);
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
               width={_full} height={_full} strokeWidth="1">
        {symbolPattern.filter((p, i) => perm[i] === '1')}
      </pattern>
    );
  });
};

var _getPatternFills = function(symbol) {
  return symbol.pattern.map((p, i) => {
    switch (p) {
      case AppConstants.FillPattern.Vertical:
        return <path d="M1.5,0L1.5,3" strokeWidth="1" stroke={symbol.color.get(i)} />;
      case AppConstants.FillPattern.Horizontal:
        return <path d="M0,1.5L3,1.5" strokeWidth="1" stroke={symbol.color.get(i)} />;
      case AppConstants.FillPattern.Dotted:
        return <circle cy="1.5" cx="1.5" r="1" fill={symbol.color.get(i)} stroke="none"/>;
      case AppConstants.FillPattern.Solid:
      default:
        return <rect x="0" y="0" width="3" height="3" fill={symbol.color.get(i)} stroke="none"/>;
    }
  }).map((q, i) => {
    return (
      <pattern key={'fill-' + i} id={'fill-' + i} width="3" height="3"
               patternUnits="userSpaceOnUse">
        {q}
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
    console.log('********** generate symbol scheme');

    // The key on the defs element is required (for now) to make sure defs are updated
    // as SVG elements by React.
    return (
      <defs key={'scheme-' + this.props.symbol.scheme}>
        {_getPatternFills(this.props.symbol)}
        {_getPatternDefs(this.props.symbol)}
      </defs>
    );
  }
});

module.exports = PedigreeDefs;
