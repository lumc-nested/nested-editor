var classnames = require('classnames');
// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var Immutable = require('immutable');
var React = require('react');
var {Button, ModalTrigger} = require('react-bootstrap');

var DocumentActions = require('../../actions/DocumentActions');
var {Symbol} = require('../../common/Structures');
var PartitionFillModal = require('../modals/PartitionFillModal');


var _full = 100;
var _half = 50;


var schemeLines = {
  0: [],
  1: [{x1: _half, y1: 0, x2: _half, y2: _full}],
  2: [{x1: 0, y1: _half, x2: _full, y2: _half}],
  3: [{x1: _half, y1: 0, x2: _half, y2: _full},
      {x1: _half, y1: _half, x2: _full, y2: _half}],
  4: [{x1: _half, y1: 0, x2: _half, y2: _full},
      {x1: 0, y1: _half, x2: _half, y2: _half}],
  5: [{x1: 0, y1: _half, x2: _full, y2: _half},
      {x1: _half, y1: _half, x2: _half, y2: _full}],
  6: [{x1: 0, y1: _half, x2: _full, y2: _half},
      {x1: _half, y1: 0, x2: _half, y2: _half}],
  7: [{x1: _half, y1: 0, x2: _half, y2: _full},
      {x1: 0, y1: _half, x2: _full, y2: _half}]
};


var schemeFills = {
  0: [{width: _full, height: _full, x: 0, y: 0}],
  1: [{width: _half, height: _full, x: 0, y: 0},
      {width: _half, height: _full, x: _half, y: 0}],
  2: [{width: _full, height: _half, x: 0, y: 0},
      {width: _full, height: _half, x: 0, y: _half}],
  3: [{width: _half, height: _full, x: 0, y: 0},
      {width: _half, height: _half, x: _half, y: 0},
      {width: _half, height: _half, x: _half, y: _half}],
  4: [{width: _half, height: _half, x: 0, y: 0},
      {width: _half, height: _half, x: 0, y: _half},
      {width: _half, height: _full, x: _half, y: 0}],
  5: [{width: _full, height: _half, x: 0, y: 0},
      {width: _half, height: _half, x: 0, y: _half},
      {width: _half, height: _half, x: _half, y: _half}],
  6: [{width: _half, height: _half, x: 0, y: 0},
      {width: _half, height: _half, x: _half, y: 0},
      {width: _full, height: _half, x: 0, y: _half}],
  7: [{width: _half, height: _half, x: 0, y: 0},
      {width: _half, height: _half, x: _half, y: 0},
      {width: _half, height: _half, x: 0, y: _half},
      {width: _half, height: _half, x: _half, y: _half}]
};


// TODO: Perhaps better to just draw with SVG.
var patternIconProps = {
  solid: {name: 'square'},
  dotted: {name: 'th'},
  vertical: {name: 'align-justify', rotate: '90'},
  horizontal: {name: 'align-justify'}
};


var SchemeIcon = React.createClass({
  propTypes: {
    scheme: React.PropTypes.number.isRequired,
    fill: React.PropTypes.number
  },

  render: function() {
    var filling;

    if (this.props.fill !== undefined) {
      filling = <rect fill="black" {...schemeFills[this.props.scheme][this.props.fill]} />;
    }

    return (
      <svg version="1.1" viewBox={`0 0 ${_full} ${_full}`} className="scheme">
        {filling}
        {schemeLines[this.props.scheme].map(
          (props, i) => <line key={i} strokeWidth={5} {...props} />
        )}
      </svg>
    );
  }
});


var FillIcon = React.createClass({
  propTypes: {
    // Sorry, we need some way of making a unique pattern id.
    id: React.PropTypes.string.isRequired,
    color: React.PropTypes.string.isRequired,
    pattern: React.PropTypes.string.isRequired,
    // For ModalTrigger.
    onClick: React.PropTypes.func
  },

  render: function() {
    var pattern;

    // TODO: We have app constants for the patterns.
    if (this.props.pattern === 'dotted') {
      pattern = <circle cy="10" cx="10" r="6.66" fill={this.props.color} stroke="none" />
    } else if (this.props.pattern === 'vertical') {
      pattern = <path d="M10,0L10,20" strokeWidth="6.66" stroke={this.props.color} />;
    } else if (this.props.pattern === 'horizontal') {
      pattern = <path d="M0,10L20,10" strokeWidth="6.66" stroke={this.props.color} />;
    } else {
      pattern = <rect x="0" y="0" width="20" height="20" fill={this.props.color} stroke="none" />;
    }

    return (
      <svg version="1.1" viewBox={`0 0 ${_full} ${_full}`} className="scheme" onClick={this.props.onClick}>
        <defs>
          <pattern id={'scheme-icon-fill-' + this.props.id} width="20" height="20" patternUnits="userSpaceOnUse">
            {pattern}
          </pattern>
        </defs>
        <rect fill={`url('#scheme-icon-fill-${this.props.id}')`} width={_full} height={_full} x="0" y="0" stroke="none" />
      </svg>
    );
  }
});


var SymbolSidebar = React.createClass({
  propTypes: {
    memberFields: React.PropTypes.object.isRequired,
    symbol: React.PropTypes.instanceOf(Symbol).isRequired
  },

  setScheme: function(scheme) {
    DocumentActions.setSymbol(this.props.symbol.set('scheme', scheme));
  },

  updateMapping: function(partition, field) {
    DocumentActions.setSymbol(this.props.symbol.setIn(['mapping', partition], field));
  },

  render: function() {
    var symbol = this.props.symbol;

    var schemes = Immutable.Range(0, 8).map(scheme => {
      var classNames = classnames('btn-check', {active: symbol.scheme === scheme});
      return (
        <span key={scheme} className={classNames} onClick={this.setScheme.bind(this, scheme)}>
          <SchemeIcon scheme={scheme} />
        </span>
      );
    });

    var partitions = schemeFills[symbol.scheme].map((_, partition) => {
      var fieldOptions = this.props.memberFields.map((title, key) => {
        return <option key={key} value={key}>{title}</option>;
      }).toArray();

      var onFieldChange = event => {
        this.updateMapping(partition, event.target.value);
      };

      /**
       * TODO: We probably want to create a component for setting the
       * partition properties (field, color, pattern). Instead of the modal
       * form for color and pattern, it should have a collapsable color and
       * pattern picker.
       * https://github.com/zippyui/react-color-picker
       */
      return (
        <div key={partition} className="form-group">
          <label htmlFor={'partition-' + partition}>
            <SchemeIcon scheme={symbol.scheme} fill={partition} /> Partition {partition + 1}
          </label>
          <div className="input-group">
            <select className="form-control" value={symbol.mapping.get(partition)} onChange={onFieldChange}>
              <option>Select member field</option>
              {fieldOptions}
            </select>
            <span className="btn-picker">
              <ModalTrigger modal={<PartitionFillModal symbol={symbol} partition={partition} />}>
                <FillIcon pattern={symbol.pattern.get(partition)}
                          color={symbol.color.get(partition)} id={partition} />
              </ModalTrigger>
            </span>
          </div>
        </div>
      );
    });

    return (
      <div>
        <h1>Annotations</h1>
        <div className="form-group">
          <label>Partitioning scheme</label>
          <div>{schemes}</div>
        </div>
        {partitions}
      </div>
    );
  }
});


module.exports = SymbolSidebar;
