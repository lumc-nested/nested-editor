'use strict';

var React = require('react');
var _ = require('lodash');
var AppActions = require('../actions/AppActions.js');
var PC = require('../constants/PedigreeConstants.js');
var PedigreeGraph = require('../layout/Pedigree.js');
var LayoutEngine = require('../layout/Engine.js');

var _svgID ="pedigree";

require('../../styles/pedigreeSVG.less');



var Member = React.createClass({

  render: function() {

    var shape;

    var member = this.props.data;

    var death = member.isDead() ? <line x1="25" y1="-25" x2="-25" y2="25" /> : undefined;
    var transform = "translate(" + member.location.x + "," + member.location.y + ")";

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
    if (this.props.pedigree === undefined) {
      return (
        <svg id={_svgID} width="100%" height="100%" onClick={this.handleClick} />
      );
    }

    var graph = new PedigreeGraph(this.props.pedigree);
    var engine = new LayoutEngine(graph);

    // TODO: get the dimentions from html
    var windowWidth = 750;
    var windowHeight = 650;

    engine.arrange(750, 650);

    var members = _.map(graph.members, function(member) {
      return <Member data={member} focused={this.props.focus === member._id} key={member._id}/>;
    }, this);

    var partners = _.map(graph.nests, function(nest, index) {
      return <line key={index}
                   x1={nest.father.location.x}
                   y1={nest.father.location.y}
                   x2={nest.mother.location.x}
                   y2={nest.mother.location.y} />;
    });

    var offsprings = [];
    _.each(graph.nests, function(nest) {
      _.each(nest.children(), function(child) {

        var d = [nest.location.x, nest.location.y, child.location.x, child.location.y];

        var diffX = d[2] - d[0],
            diffY = d[3] - d[1];

        var pathString = "M" + d[0] + "," + d[1] +    // start position
                         "l" + 0 + "," + diffY / 2 +  // line of desent
                         "l" + diffX + "," + 0 +      // sibship line
                         "l" + 0 + "," + diffY / 2;   // individual's line

        offsprings.push(<path d={pathString} />);
      });
    });

    var leftmost = _.min(graph.members, function(m) { return m.location.x; }).location.x;
    var translate = "translate(" + (leftmost < 50 ? Math.abs(leftmost - 50) : 0) + ",50)";

    return (
      <svg id={_svgID} width="100%" height="100%" onClick={this.handleClick}>
        <g transform={translate}>
          {partners}
          {offsprings}
          {members}
        </g>
      </svg>
    );
  },

  handleClick: function() {
    AppActions.changeFocus();
  }
});

module.exports = PedigreeSVG;
