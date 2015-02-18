'use strict';

var React = require('react');
var AppActions = require('../actions/AppActions.js');
var PC = require('../constants/PedigreeConstants.js');

var arrowPath = 'M' + (-PC.MemberSize / 2 - 10) + ',' + (PC.MemberSize / 2 + 10) + 'l9,-9l-3,6l-3,-3l6,-3';
var size = PC.MemberSize;
var radius = PC.MemberSize / 2;
var paddedRadius = radius + PC.MemberPadding;
var diamondPoints = [-radius, 0, 0, radius, radius, 0, 0, -radius].join(',');


var MemberSVG = React.createClass({

  render: function() {

    var shape, death, arrow, p, transform;

    var member = this.props.data;

    if (member.isDead()) {
      death = <line x1={paddedRadius} y1={-paddedRadius} x2={-paddedRadius} y2={paddedRadius} />;
    }

    if (member.isProband()) {
      arrow = <path className="arrow" d={arrowPath} />;
      p = <text className="proband" x={-radius - 18} y={radius + 10}>P</text>;
    }

    if (member.isConsultand()) {
      arrow = <path className="arrow" d={arrowPath} />;
    }

    transform = 'translate(' + member.location.x + ',' + member.location.y + ')';

    // TODO: how to detect pregnancies not carried to terms? The triangle shape.

    switch (member.gender()) {
    case 1:
      // the rectangle looks bigger than the other two. shrink it a bit.
      shape = <rect width={size - 4} height={size - 4} x={-radius + 2} y={-radius + 2} />;
      break;
    case 2:
      shape = <circle r={radius} />;
      break;
    default:
      shape = <polygon points={diamondPoints} />;
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
    AppActions.changeFocus({
      'level': PC.FocusLevel.Member,
      'key': this.props.data._id
    });
  }
});

module.exports = MemberSVG;
