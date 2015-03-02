'use strict';


var _ = require('lodash');
var Immutable = require('immutable');
var React = require('react');

var DocumentActions = require('../actions/DocumentActions');
var LayoutEngine = require('../layout/Engine');
var AppConstants = require('../constants/AppConstants');
var MemberSVG = require('./MemberSVG');
var NestSVG = require('./NestSVG');


var LayoutView = React.createClass({
  getInitialState: function() {
    // Todo: Ideally the layout state we get from the LayoutEngine is an
    // immutable object (or alternatively, we convert it to one). I think it
    // would be best if our state would only contain layout data, it could
    // be used for drawing together with the props.pedigree object.
    var layout = {};
    var engine;

    // TODO: Layout engine shouldn't choke on empty pedigree.
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
    var focused;
    var members;
    var nests;
    var xs;
    var leftmost;
    var rightmost;
    var shift;
    var translate;

    members = _.map(this.state.layout.members, function(member) {
      var isSelected = focus.level === AppConstants.FocusLevel.Member &&
                       focus.key === member._id;
      return <MemberSVG data={member}
                        focused={isSelected}
                        key={'member-' + member._id}/>;
    });

    nests = _.map(this.state.layout.nests, function(nest, index) {
      var isSelected = focus.level === AppConstants.FocusLevel.Nest &&
                       focus.key.equals(Immutable.Set.of(nest.father._id, nest.mother._id));
      return <NestSVG data={nest}
                      focused={isSelected}
                      key={'nest-' + index}/>;
    });

    xs = _.pluck(this.state.layout.members, function(m) {
      return m.location.x;
    });
    leftmost = _.min(xs);
    rightmost = _.max(xs);
    shift = windowWidth / 2 - (leftmost + (rightmost - leftmost) / 2);
    translate = `translate(${shift},50)`;

    return (
      <svg id="layout" width="100%" height="100%" onClick={this.handleClick}>
        <g transform={translate} key={'pedigree-' + this.state.layout.id}>
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
