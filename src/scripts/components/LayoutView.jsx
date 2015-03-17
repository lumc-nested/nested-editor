'use strict';

var React = require('react');

var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var LayoutEngine = require('../layout/Engine');
var MemberSVG = require('./MemberSVG');
var NestSVG = require('./NestSVG');


var LayoutView = React.createClass({
  getInitialState: function() {
    var layout;
    var engine;

    if (this.props.pedigree.members.size > 0) {
      engine = new LayoutEngine(this.props.pedigree);
      layout = engine.arrange();
    }

    return {layout};
  },

  componentWillReceiveProps: function(nextProps) {
    var engine;

    if (!this.props.pedigree.equals(nextProps.pedigree)) {
      engine = new LayoutEngine(nextProps.pedigree);
      console.log('redo layout');

      this.setState({layout: engine.arrange()});
    }
  },

  render: function() {
    // TODO: get the dimentions from html
    var windowWidth = 750;
    var focus = this.props.focus;
    var membersLayout = this.state.layout.get('members');
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
                          location={membersLayout.get(memberKey)}
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
                        layout={this.state.layout}
                        focused={isSelected}
                        key={'nest-' + nestKey.join(',')}/>;
      })
      .toArray();

    leftmost = membersLayout
      .minBy(member => member.get('x'))
      .get('x');

    rightmost = membersLayout
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
