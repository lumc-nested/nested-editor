'use strict';

var React = require('react');
var _ = require('lodash');
var AppActions = require('../actions/AppActions.js');
var PC = require('../constants/PedigreeConstants.js');
var LayoutEngine = require('../layout/Engine.js');

var _svgID ="pedigree";

require('../../styles/pedigreeSVG.less');


var arrowPath = "M" + (-PC.MemberSize / 2 - 10) + "," + (PC.MemberSize / 2 + 10) + "l9,-9l-3,6l-3,-3l6,-3";

var Member = React.createClass({

  render: function() {

    var shape, death, arrow, p;

    var member = this.props.data;
    var size = PC.MemberSize;
    var radius = PC.MemberSize / 2;
    var paddedRadius = radius + PC.MemberPadding;

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

    var transform = "translate(" + member.location.x + "," + member.location.y + ")";

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
        var points = [-radius, 0, 0, radius, radius, 0, 0, -radius].join(",");
        shape = <polygon points={points} />;
    }

    return (
      <g transform={transform} onClick={this.handleClick} className={this.props.focused ? "focus" : ""} >
        {shape}
        {death}
        {arrow}
        {p}
      </g>
    );
  },

  handleClick: function(e) {
    e.stopPropagation();
    AppActions.changeFocus(this.props.data._id);
  }
});


var PedigreeSVG = React.createClass({

  getInitialState: function() {

    var layout = {};

    if (this.props.peidgree !== undefined) {
      var engine = new LayoutEngine(this.props.pedigree);
      layout = engine.arrange();
    }

    return {
      "layout": layout
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // require immutable objects.
    if (this.props.pedigree !== nextProps.pedigree) {
      console.log("redo layout");
      var engine = new LayoutEngine(nextProps.pedigree);

      this.setState({
        layout: engine.arrange()
      });
    }
  },


  render: function() {
    if (this.props.pedigree === undefined) {
      return (
        <svg id={_svgID} width="100%" height="100%" onClick={this.handleClick} />
      );
    }

    // TODO: get the dimentions from html
    var windowWidth = 750;
    var windowHeight = 650;

    var members = _.map(this.state.layout.members, function(member) {
      return <Member data={member} focused={this.props.focus === member._id} key={member._id}/>;
    }, this);

    var partners = _.map(this.state.layout.nests, function(nest, index) {
      return <line key={index}
                   x1={nest.father.location.x}
                   y1={nest.father.location.y}
                   x2={nest.mother.location.x}
                   y2={nest.mother.location.y} />;
    });

    var offsprings = [];
    _.each(this.state.layout.nests, function(nest) {
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

    var xs = _.pluck(this.state.layout.members, function(m) { return m.location.x; });
    var leftmost = _.min(xs);
    var rightmost = _.max(xs);
    var shift = windowWidth / 2 - (leftmost + (rightmost - leftmost) / 2);
    var translate = "translate(" + shift + ",50)";

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
