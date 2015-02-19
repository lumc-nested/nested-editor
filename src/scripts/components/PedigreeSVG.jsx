'use strict';

var React = require('react');
var _ = require('lodash');
var AppActions = require('../actions/AppActions.js');
var PC = require('../constants/PedigreeConstants.js');
var LayoutEngine = require('../layout/Engine.js');
var MemberSVG = require('./MemberSVG');
var NestSVG = require('./NestSVG');

var _svgID = 'pedigree';


var PedigreeSVG = React.createClass({

  getInitialState: function() {
    // Todo: Ideally the layout state we get from the LayoutEngine is an
    // immutable object (or alternatively, we convert it to one). I think it
    // would be best if our state would only contain layout data, it could
    // be used for drawing together with the props.pedigree object.
    var layout = {};
    var engine;

    if (this.props.pedigree !== undefined) {
      // Todo: Remove the need for .toJS()
      engine = new LayoutEngine(this.props.pedigree.toJS());
      layout = engine.arrange();
    }

    return {
      'layout': layout
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // require immutable objects.
    var engine;
    if (this.props.pedigree !== nextProps.pedigree) {
      // Todo: Remove the need for .toJS()
      engine = new LayoutEngine(nextProps.pedigree.toJS());
      console.log('redo layout');

      this.setState({
        layout: engine.arrange()
      });
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

    if (this.props.pedigree === undefined) {
      return (
        <svg id={_svgID} width="100%" height="100%" onClick={this.handleClick} />
      );
    }

    // is it focused on a member?
    focused = focus !== undefined && focus.get('level') === PC.FocusLevel.Member;
    members = _.map(this.state.layout.members, function(member) {
      return <MemberSVG data={member}
                        focused={focused && focus.get('key') === member._id}
                        key={'member-' + member._id}/>;
    });

    // is it focused on a nest?
    focused = focus !== undefined && focus.get('level') === PC.FocusLevel.Nest;
    nests = _.map(this.state.layout.nests, function(nest, index) {
      return <NestSVG data={nest}
                      focused={focused &&
                               focus.getIn(['key', 'father']) === nest.father._id &&
                               focus.getIn(['key', 'mother']) === nest.mother._id}
                      key={'nest-' + index}/>;
    });

    xs = _.pluck(this.state.layout.members, function(m) {
      return m.location.x;
    });
    leftmost = _.min(xs);
    rightmost = _.max(xs);
    shift = windowWidth / 2 - (leftmost + (rightmost - leftmost) / 2);
    translate = 'translate(' + shift + ',50)';

    return (
      <svg id={_svgID} width="100%" height="100%" onClick={this.handleClick}>
        <g transform={translate} key={'pedigree-' + this.state.layout.id}>
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


require('../../styles/pedigreeSVG.less');


module.exports = PedigreeSVG;
