'use strict';

var React = require('react');
var _ = require('lodash');


var NestSVG = React.createClass({
  render: function() {

    var nest = this.props.data;

    var mating = <line x1={nest.father.location.x}
                       y1={nest.father.location.y}
                       x2={nest.mother.location.x}
                       y2={nest.mother.location.y} />;

    var offsprings = [];
    _.each(nest.children(), function(child) {

      var d = [nest.location.x, nest.location.y, child.location.x, child.location.y];

      var diffX = d[2] - d[0],
          diffY = d[3] - d[1];

      var pathString = "M" + d[0] + "," + d[1] +    // start position
                       "l" + 0 + "," + diffY / 2 +  // line of desent
                       "l" + diffX + "," + 0 +      // sibship line
                       "l" + 0 + "," + diffY / 2;   // individual's line

      offsprings.push(<path d={pathString} />);
    });

    return (
      <g>
        {mating}
        {offsprings}
      </g>
    );
  }
});

module.exports = NestSVG;
