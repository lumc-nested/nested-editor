'use strict';

var React = require('react');

var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var LayoutUtils = require('../layout/Utils');
var MemberSVG = require('./SVG/MemberSVG');
var NestSVG = require('./SVG/NestSVG');


var LayoutView = React.createClass({
  getInitialState: function() {
    return {layout: LayoutUtils.getLayout(this.props.pedigree)};
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this.props.pedigree.equals(nextProps.pedigree)) {
      console.log('redo layout');
      this.setState({layout: LayoutUtils.getLayout(nextProps.pedigree)});
    }
  },

  render: function() {
    // TODO: get the dimentions from html
    var windowWidth = 750;
    var focus = this.props.focus;
    var layout = this.state.layout;
    var focused;
    var members;
    var nests;
    var leftmost;
    var rightmost;
    var shift;
    var translate;

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
    translate = `translate(${shift},50)`;

    return (
      <svg id="layout" width="100%" height="100%" onClick={this.handleClick}>
        <g transform={translate} key={'pedigree'}>
          {nests}
          {members}
        </g>
      </svg>
    );
  },

  handleClick: function() {
    DocumentActions.setFocus(AppConstants.FocusLevel.Pedigree);
  }
});


require('../../styles/layout.less');


module.exports = LayoutView;
