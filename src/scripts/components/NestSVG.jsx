'use strict';

var React = require('react');
var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');


var NestSVG = React.createClass({
  render: function() {

    var nest = this.props.data;
    var memberLocations = this.props.layout.get('members');
    var nestLocation = this.props.layout.getIn(['nests', this.props.nestKey]);
    var [father, mother] = this.props.nestKey.toArray();
    var offsprings = {};

    var mating = <line x1={memberLocations.getIn([father, 'x'])}
                       y1={memberLocations.getIn([father, 'y'])}
                       x2={memberLocations.getIn([mother, 'x'])}
                       y2={memberLocations.getIn([mother, 'y'])} />;

    nest.pregnancies.forEach(pregancy => {

      // TODO: twins.
      pregancy.zygotes.forEach(zygote => {

        var d = [nestLocation.get('x'),
                 nestLocation.get('y'),
                 memberLocations.getIn([zygote, 'x']),
                 memberLocations.getIn([zygote, 'y'])];

        var diffX = d[2] - d[0];
        var diffY = d[3] - d[1];

        var pathString = `M${d[0]},${d[1]}` +    // start position
                         `l0,${diffY / 2}` +  // line of desent
                         `l${diffX},0` +      // sibship line
                         `l0,${diffY / 2}`;   // individual's line

        offsprings['offspring-' + memberLocations.getIn([zygote, 'sibIndex'])] = <path d={pathString} />;
      });
    });

    return (
      <g onClick={this.handleClick} className={this.props.focused ? 'focus' : ''} >
        {mating}
        {offsprings}
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
