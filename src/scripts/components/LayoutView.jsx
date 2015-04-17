'use strict';

var React = require('react/addons');

var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var LayoutUtils = require('../layout/Utils');
var MemberSVG = require('./SVG/MemberSVG');
var NestSVG = require('./SVG/NestSVG');
var Utils = require('./Utils');


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

  zoom: function(delta) {
    this.setState({zoomLevel: this.state.zoomLevel + delta});
  },

  componentDidMount: function () {
    var style = Utils.getComputedStyles(this.refs.layout);
    this.setState({
      width: parseInt(style.width, 10),
      height: parseInt(style.height, 10)
    });
  },

  render: function() {

    var focus = this.props.focus;
    var layout = this.state.layout;
    // TODO: resize
    var windowWidth = this.state.width;
    var zoomLevel = this.state.zoomLevel;
    var controls;
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

    controls = React.addons.createFragment({
      zoomIn: Utils.tooltipButton({
        tooltipText: `Zoom to ${100 + (zoomLevel + 1) * 20}%`,
        tooltipPlacement: 'right',
        onClickHandle: this.zoom.bind(this, 1),
        buttonClass: 'zoom-in',
        iconName: 'search-plus'
      }, zoomLevel >= 5),
      zoomOut: Utils.tooltipButton({
        tooltipText: `Zoom to ${100 + (zoomLevel - 1) * 20}%`,
        tooltipPlacement: 'right',
        onClickHandle: this.zoom.bind(this, -1),
        buttonClass: 'zoom-out',
        iconName: 'search-minus'
      }, zoomLevel <= -4)
    });

    return (
      <div ref="layout" id="layout-view">
        {controls}
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
