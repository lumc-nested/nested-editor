'use strict';

var React = require('react');
var _ = require('lodash');
var AppActions = require('../actions/AppActions.js');
var PC = require('../constants/PedigreeConstants.js');
var LayoutEngine = require('../layout/Engine.js');
var MemberSVG = require('./MemberSVG');
var NestSVG = require('./NestSVG');

var _svgID ="pedigree";

require('../../styles/pedigreeSVG.less');


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
      return <MemberSVG data={member} focused={this.props.focus === member._id} key={member._id}/>;
    }, this);

    var nests = _.map(this.state.layout.nests, function(nest, index) {
      return <NestSVG data={nest} key={index}/>;
    });

    var xs = _.pluck(this.state.layout.members, function(m) { return m.location.x; });
    var leftmost = _.min(xs);
    var rightmost = _.max(xs);
    var shift = windowWidth / 2 - (leftmost + (rightmost - leftmost) / 2);
    var translate = "translate(" + shift + ",50)";

    return (
      <svg id={_svgID} width="100%" height="100%" onClick={this.handleClick}>
        <g transform={translate}>
          {nests}
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
