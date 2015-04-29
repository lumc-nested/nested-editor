'use strict';

var classnames = require('classnames');
var React = require('react');


var AppConfig = require('../../constants/AppConfig');
var AppConstants = require('../../constants/AppConstants');
var DocumentActions = require('../../actions/DocumentActions');
var {Member, ObjectRef} = require('../../common/Structures');


var _arrowPath = `M${-AppConfig.MemberSize / 2 - 10},${AppConfig.MemberSize / 2 + 10}l9,-9l-3,6l-3,-3l6,-3`;
var _size = AppConfig.MemberSize;
var _radius = AppConfig.MemberSize / 2;
var _paddedRadius = _radius + AppConfig.MemberPadding / 2;
var _diamondPoints = [-_radius, 0, 0, _radius, _radius, 0, 0, -_radius].join(',');

var _isDead = function(fields) {
  return fields.has('dateOfDeath') || fields.get('deceased');
};

var MemberSVG = React.createClass({

  propTypes: {
    data: React.PropTypes.instanceOf(Member).isRequired,
    focused: React.PropTypes.bool.isRequired,
    location: React.PropTypes.object.isRequired,
    symbolDef: React.PropTypes.object.isRequired,
    memberKey: React.PropTypes.string.isRequired
  },

  render: function() {
    var shape;
    var death;
    var arrow;
    var p;
    var annotation;
    var transform;
    var symbolState;
    var shapeProps;

    var member = this.props.data;
    var location = this.props.location;

    if (_isDead(member.fields)) {
      death = <line x1={_paddedRadius} y1={-_paddedRadius} x2={-_paddedRadius} y2={_paddedRadius} />;
    }

    if (member.fields.get('proband')) {
      arrow = <path className="arrow" d={_arrowPath} />;
      p = <text className="proband" x={-_radius - 18} y={_radius + 10}>P</text>;
    }

    if (member.fields.get('consultand')) {
      arrow = <path className="arrow" d={_arrowPath} />;
    }

    transform = `translate(${location.get('x')},${location.get('y')})`;

    // TODO: how to detect pregnancies not carried to terms? The triangle shape.

    symbolState = this.props.symbolDef
      .map(m => member.fields.get(m) ? 1 : 0)
      .join('');
    if (parseInt(symbolState, 2) > 0) {
      shapeProps = {fill: `url('#symbol-pattern-${symbolState}')`};
    }

    switch (member.fields.get('gender')) {
      case 1:
        shape = <rect width={_size} height={_size} x={-_radius} y={-_radius} {...shapeProps}/>;
        break;
      case 2:
        shape = <circle r={_radius} {...shapeProps}/>;
        break;
      default:
        shape = <polygon points={_diamondPoints} {...shapeProps}/>;
    }

    // TODO: this is for debugging for now.
    // need to properly handle annotations.
    annotation = <text x={-5} y={_size}>{this.props.memberKey}</text>;

    return (
      <g transform={transform} onClick={this.handleClick}
         className={classnames({focus: this.props.focused})}>
        {shape}
        {death}
        {arrow}
        {p}
        {annotation}
      </g>
    );
  },

  handleClick: function(e) {
    e.stopPropagation();
    DocumentActions.setFocus(new ObjectRef({
      type: AppConstants.ObjectType.Member,
      key: this.props.memberKey
    }));
  }
});

module.exports = MemberSVG;
