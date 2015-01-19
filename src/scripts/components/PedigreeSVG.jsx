'use strict';

var React = require('react');
var AppActions = require('../actions/AppActions.js');
var _ = require('lodash');
var doLayout = require('../layout/engine.js');

var _svgID ="pedigree";

require('../../styles/pedigreeSVG.less');



var Member = React.createClass({

  render: function() {

    var shape;

    var member = this.props.data;

    var death = member.isDead() ? <line x1="25" y1="-25" x2="-25" y2="25" /> : undefined;
    var transform = "translate(" + member.x + "," + member.y + ")";

    // TODO: how to detect pregnancies not carried to terms? The triangle shape.

    switch (member.gender()) {
      case 1:
        shape = <rect width="36" height="36" x="-18" y="-18" />;
        break;
      case 2:
        shape = <circle r="20" />;
        break;
      default:
        shape = <polygon points="-20,0,0,20,20,0,0,-20" />;
    }

    return (
      <g transform={transform} onClick={this.handleClick} className={this.props.focused ? "focus" : ""} >
        {shape}
        {death}
      </g>
    );
  },

  handleClick: function(e) {
    e.stopPropagation();
    AppActions.changeFocus(this.props.data._id);
  }
});


var PedigreeSVG = React.createClass({


  render: function() {

    var layout = doLayout(this.props.pedigree);
    console.log(layout);

    var members = _.map(this.props.pedigree.members, function(member) {
      _.extend(member, _.find(layout.locations, {_id: member._id}));
      return <Member data={member} focused={this.props.focus === member._id} key={member._id}/>;
    }, this);

    var partners = _.map(layout.partners, function(d) {
      return <line x1={d[0]} y1={d[1]} x2={d[2]} y2={d[3]} />;
    });

    var offsprings = _.map(layout.offsprings, function(d) {

      var diffX = d[2] - d[0],
          diffY = d[3] - d[1];

      var pathString = "M" + d[0] + "," + d[1] +    // start position
                       "l" + 0 + "," + diffY / 2 +  // line of desent
                       "l" + diffX + "," + 0 +      // sibship line
                       "l" + 0 + "," + diffY / 2;   // individual's line

      return <path d={pathString} />;
    });

    return (
      <svg id={_svgID} width="100%" height="100%" onClick={this.handleClick}>
        {partners}
        {offsprings}
        {members}
      </svg>
    );
  },

  handleClick: function() {
    AppActions.changeFocus();
  }
});

module.exports = PedigreeSVG;
