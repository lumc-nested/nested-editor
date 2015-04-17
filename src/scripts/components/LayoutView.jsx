'use strict';

var Icon = require('react-fa/dist/Icon');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var LayoutUtils = require('../layout/Utils');
var MemberSVG = require('./SVG/MemberSVG');
var NestSVG = require('./SVG/NestSVG');
var Utils = require('../common/Utils');


var Button = ReactBootstrap.Button;


var LayoutView = React.createClass({
  getInitialState: function() {
    return {
      layout: LayoutUtils.getLayout(this.props.pedigree),
      zoomLevel: 0,
      width: 100
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this.props.pedigree.equals(nextProps.pedigree)) {
      console.log('redo layout');
      this.setState({layout: LayoutUtils.getLayout(nextProps.pedigree)});
    }
  },

  zoomIn: function() {
    this.setState({zoomLevel: this.state.zoomLevel + 1});
  },

  zoomOut: function() {
    this.setState({zoomLevel: this.state.zoomLevel - 1});
  },

  componentDidMount: function () {
    var style = Utils.getComputedStyles(this.refs.layout);
    this.setState({
      width: parseInt(style.width, 10),
      height: parseInt(style.height, 10)
    });
  },

  render: function() {

    // TODO: resize
    var windowWidth = this.state.width;
    var focus = this.props.focus;
    var layout = this.state.layout;
    var zoomLevel = this.state.zoomLevel;
    var focused;
    var members;
    var nests;
    var leftmost;
    var rightmost;
    var shift;
    var transform;

    members = this.props.pedigree.members
      .map((member, memberKey) => {
        var isSelected = focus.level === AppConstants.FocusLevel.Member &&
                         focus.key === memberKey;
        return <MemberSVG data={member}
                          memberKey={memberKey}
                          location={layout.getIn(['members', memberKey])}
                          focused={isSelected}
                          key={'member-' + memberKey}/>;
      })
      .toArray();

    nests = this.props.pedigree.nests
      .map((nest, nestKey) => {
        var isSelected = focus.level === AppConstants.FocusLevel.Nest &&
                         focus.key.equals(nestKey);
        return <NestSVG data={nest}
                        nestKey={nestKey}
                        layout={layout}
                        focused={isSelected}
                        key={'nest-' + nestKey.join(',')}/>;
      })
      .toArray();

    leftmost = layout.get('members')
      .minBy(member => member.get('x'))
      .get('x');

    rightmost = layout.get('members')
      .maxBy(member => member.get('x'))
      .get('x');

    shift = windowWidth / 2 - (leftmost + (rightmost - leftmost) / 2);
    transform = `translate(${shift},50) scale(${1 + zoomLevel / 5})`;

    return (
      <div ref="layout" id="layout-view">

        <Button className="zoom-in" onClick={this.zoomIn} disabled={zoomLevel >= 5 ? 'disabled' : ''}>
          <Icon name="search-plus" />
        </Button>
        <Button className="zoom-out" onClick={this.zoomOut} disabled={zoomLevel <= -4 ? 'disabled' : ''}>
          <Icon name="search-minus" />
        </Button>

        <svg id="layout" onClick={this.handleClick}>
          <g transform={transform} key={'pedigree'}>
            {nests}
            {members}
          </g>
        </svg>
      </div>
    );
  },

  handleClick: function() {
    DocumentActions.setFocus(AppConstants.FocusLevel.Pedigree);
  }
});


module.exports = LayoutView;
