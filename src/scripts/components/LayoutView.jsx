'use strict';

var React = require('react/addons');

var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var PedigreeDefs = require('./SVG/PedigreeDefs');
var PedigreeSVG = require('./SVG/PedigreeSVG');
var {Pedigree, Symbol, Ref} = require('../common/Structures');
var Utils = require('./Utils');


var LayoutView = React.createClass({
  propTypes: {
    focus: React.PropTypes.instanceOf(Ref).isRequired,
    pedigree: React.PropTypes.instanceOf(Pedigree).isRequired,
    symbol: React.PropTypes.instanceOf(Symbol).isRequired
  },

  getInitialState: function() {
    return {
      zoomLevel: 1,
      width: 100,
      height: 100
    };
  },

  zoomStep: function(delta) {
    this.setState({zoomLevel: this.state.zoomLevel + delta});
  },

  zoomSlide: function(event) {
    this.setState({zoomLevel: parseFloat(event.target.value, 10)});
  },

  componentDidMount: function () {
    var style = Utils.getComputedStyles(this.refs.layout);
    this.setState({
      width: parseInt(style.width, 10),
      height: parseInt(style.height, 10)
    });
  },

  render: function() {
    var zoomLevel = this.state.zoomLevel;
    var controls;
    var defs;

    controls = React.addons.createFragment({
      zoomIn: Utils.tooltipButton({
        tooltipText: `Zoom to ${Math.round(zoomLevel * 100)}%`,
        tooltipPlacement: 'right',
        onClickHandle: this.zoomStep.bind(this, 0.2),
        buttonClass: 'zoom-in',
        iconName: 'search-plus'
      }, zoomLevel >= 2),
      zoomOut: Utils.tooltipButton({
        tooltipText: `Zoom to ${Math.round(zoomLevel * 100)}%`,
        tooltipPlacement: 'right',
        onClickHandle: this.zoomStep.bind(this, -0.2),
        buttonClass: 'zoom-out',
        iconName: 'search-minus'
      }, zoomLevel <= 0.25) // 0.05 padding to avoid floating number errors.
    });

    if (this.props.symbol.scheme !== undefined) {
      defs = <PedigreeDefs symbol={this.props.symbol} />;
    }

    return (
      <div ref="layout" id="layout-view">
        <div id="controls">
          {controls}
          <input id="slider" type="range" min="0.2" max="2.0" step="0.2"
                 value={this.state.zoomLevel}
                 onChange={this.zoomSlide} />
        </div>
        <svg version="1.1" id="layout" onClick={this.handleClick}>
          {defs}
          <PedigreeSVG data={this.props.pedigree}
                       width={this.state.width}
                       focus={this.props.focus}
                       scale={zoomLevel}
                       symbol={this.props.symbol} />
        </svg>
      </div>
    );
  },

  handleClick: function() {
    DocumentActions.setFocus(new Ref({type: AppConstants.ObjectType.Pedigree}));
  }
});


module.exports = LayoutView;
