'use strict';

var React = require('react');


var AppConfig = require('../constants/AppConfig');
var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');

var _arrowPath = `M${-AppConfig.MemberSize / 2 - 10},${AppConfig.MemberSize / 2 + 10}l9,-9l-3,6l-3,-3l6,-3`;
var _size = AppConfig.MemberSize;
var _radius = AppConfig.MemberSize / 2;
var _paddedRadius = _radius + AppConfig.MemberPadding;
var _diamondPoints = [-_radius, 0, 0, _radius, _radius, 0, 0, -_radius].join(',');

var _isDead = function(member) {
  return member.has('dateOfDeath') || member.get('deceased');
};

var MemberSVG = React.createClass({

  render: function() {
    var shape;
    var death;
    var arrow;
    var p;
    var transform;

    var member = this.props.data;
    var location = this.props.location;

    if (_isDead(member)) {
      death = <line x1={_paddedRadius} y1={-_paddedRadius} x2={-_paddedRadius} y2={_paddedRadius} />;
    }

    if (member.get('proband')) {
      arrow = <path className="arrow" d={_arrowPath} />;
      p = <text className="proband" x={-_radius - 18} y={_radius + 10}>P</text>;
    }

    if (member.get('consultand')) {
      arrow = <path className="arrow" d={_arrowPath} />;
    }

    transform = `translate(${location.get('x')},${location.get('y')})`;

    // TODO: how to detect pregnancies not carried to terms? The triangle shape.

    switch (member.get('gender')) {
      case 1:
        // the rectangle looks bigger than the other two. shrink it a bit.
        shape = <rect width={_size - 4} height={_size - 4} x={-_radius + 2} y={-_radius + 2} />;
        break;
      case 2:
        shape = <circle r={_radius} />;
        break;
      default:
        shape = <polygon points={_diamondPoints} />;
    }

    return (
      <g transform={transform} onClick={this.handleClick} className={this.props.focused ? 'focus' : ''} >
        {shape}
        {death}
        {arrow}
        {p}
      </g>
    );
  },

  handleClick: function(e) {
    e.stopPropagation();
    DocumentActions.setFocus(AppConstants.FocusLevel.Member, this.props.memberKey);
  }
});

module.exports = MemberSVG;
