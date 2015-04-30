'use strict';

var classnames = require('classnames');
var React = require('react');

var AppConfig = require('../../constants/AppConfig');
var AppConstants = require('../../constants/AppConstants');
var DocumentActions = require('../../actions/DocumentActions');
var {Nest, ObjectRef} = require('../../common/Structures');
var PregnancySVG = require('./PregnancySVG');
var SVGPathBuilder = require('./SVGPathBuilder');

var NestSVG = React.createClass({

  propTypes: {
    data: React.PropTypes.instanceOf(Nest).isRequired,
    focused: React.PropTypes.bool.isRequired,
    layout: React.PropTypes.object.isRequired,
    nestKey: React.PropTypes.object.isRequired
  },

  render: function() {

    var nest = this.props.data;
    var membersLayout = this.props.layout.get('members');
    var nestLayout = this.props.layout.getIn(['nests', this.props.nestKey]);
    var [parent1, parent2] = this.props.nestKey.toArray();
    var pathBuilder = new SVGPathBuilder();
    var sibLineY = nestLayout.get('y') + AppConfig.GenerationDistance / 2;
    var pregnancies;

    if (membersLayout.getIn([parent1, 'x']) > membersLayout.getIn([parent2, 'x'])) {
      // swap the parents
      [parent1, parent2] = [parent2, parent1];
    }

    // mating (horizontal) line
    pathBuilder.moveTo(
      membersLayout.getIn([parent1, 'x']) + AppConfig.MemberSize / 2,
      membersLayout.getIn([parent1, 'y']));
    pathBuilder.lineTo(
      membersLayout.getIn([parent2, 'x']) - AppConfig.MemberSize / 2,
      membersLayout.getIn([parent2, 'y']));

    if (nest.pregnancies.size) {
      // kinship (vertical) line
      pathBuilder.moveTo(nestLayout.get('x'), nestLayout.get('y'));
      pathBuilder.lineTo(nestLayout.get('x'), sibLineY);

      if (nest.pregnancies.size > 1) {
        // sibship (horizontal) line
        pathBuilder.moveTo(nestLayout.get('pregnancies').first().get('x') - 0.5, sibLineY);
        pathBuilder.lineTo(nestLayout.get('pregnancies').last().get('x') + 0.5, sibLineY);
      }

      pregnancies = nest.pregnancies.zip(nestLayout.get('pregnancies')).map(([pregnancy, layout], index) => {
        return <PregnancySVG key={'pregnancy_' + index}
                             layout={layout.set('y', sibLineY)}
                             data={pregnancy}
                             members={membersLayout} />;
      }).toJS();

    }

    // add a transparent circle to increase the hit area of the nest.
    return (
      <g onClick={this.handleClick}
         className={classnames({focus: this.props.focused})}>
        <path d={pathBuilder.toString()} />
        <circle cx={nestLayout.get('x')}
                cy={nestLayout.get('y')}
                r={AppConfig.MemberSize / 2}
                fill="transparent" stroke="none" />
        {pregnancies}
      </g>
    );
  },

  handleClick: function(e) {
    e.stopPropagation();
    DocumentActions.setFocus(new ObjectRef({
      type: AppConstants.ObjectType.Nest,
      key: this.props.nestKey
    }));
  }
});

module.exports = NestSVG;
