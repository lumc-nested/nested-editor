'use strict';

var React = require('react');
var DocumentActions = require('../actions/DocumentActions');
var AppConfig = require('../constants/AppConfig');
var AppConstants = require('../constants/AppConstants');

var arrowPath = 'M' + (-AppConfig.MemberSize / 2 - 10) + ',' +
                (AppConfig.MemberSize / 2 + 10) + 'l9,-9l-3,6l-3,-3l6,-3';
var size = AppConfig.MemberSize;
var radius = AppConfig.MemberSize / 2;
var paddedRadius = radius + AppConfig.MemberPadding;
var diamondPoints = [-radius, 0, 0, radius, radius, 0, 0, -radius].join(',');


var MemberSVG = React.createClass({

  render: function() {
    var shape;
    var death;
    var arrow;
    var p;
    var transform;

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
    DocumentActions.setFocus(AppConstants.FocusLevel.Member, this.props.data._id);
  }
});

module.exports = MemberSVG;
