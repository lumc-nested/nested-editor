'use strict';

var React = require('react');

var AppConfig = require('../../constants/AppConfig');
var AppConstants = require('../../constants/AppConstants');
var DocumentActions = require('../../actions/DocumentActions');
var PregnancySVG = require('./PregnancySVG');
var SVGPathBuilder = require('./SVGPathBuilder');

var NestSVG = React.createClass({
  render: function() {

    var nest = this.props.data;
    var membersLayout = this.props.layout.get('members');
    var nestLayout = this.props.layout.getIn(['nests', this.props.nestKey]);
    var [father, mother] = this.props.nestKey.toArray();
    var pathBuilder = new SVGPathBuilder();
    var sibLineY = nestLayout.get('y') + AppConfig.GenerationDistance / 2;
    var pregnancies;

    // mating (horizontal) line
    pathBuilder.moveTo(membersLayout.getIn([father, 'x']), membersLayout.getIn([father, 'y']));
    pathBuilder.lineTo(membersLayout.getIn([mother, 'x']), membersLayout.getIn([mother, 'y']));

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

    return (
      <g onClick={this.handleClick} className={this.props.focused ? 'focus' : ''} >
        <path d={pathBuilder.toString()} />
        {pregnancies}
      </g>
    );
  },

  handleClick: function(e) {
    e.stopPropagation();
    DocumentActions.setFocus(
      AppConstants.FocusLevel.Nest,
      this.props.nestKey
    );
  }
});

module.exports = NestSVG;
