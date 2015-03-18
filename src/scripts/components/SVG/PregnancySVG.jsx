'use strict';

var React = require('react');

var AppConfig = require('../../constants/AppConfig');
var SVGPathBuilder = require('./SVGPathBuilder');


var PregnancySVG = React.createClass({
  render: function() {
    var layout = this.props.layout;
    var pregnancy = this.props.data;
    var memberLocations = this.props.members;
    var monozygotic = pregnancy.fields.get('monozygotic');

    var path = new SVGPathBuilder();
    var symbol;
    var symbolWidth;
    var symbolHeight;
    var symbolY;

    var distanceToTop = AppConfig.MemberSize / 2;

    pregnancy.zygotes.forEach(zygote => {
      path.moveTo(layout.get('x'), layout.get('y'));
      path.lineTo(memberLocations.getIn([zygote, 'x']), memberLocations.getIn([zygote, 'y']) - distanceToTop);
    });

    if (pregnancy.zygotes.size > 1) {

      symbolWidth = layout.get('width') / 5 + 1;
      symbolHeight = (AppConfig.GenerationDistance - AppConfig.MemberSize / 2) / 5;
      symbolY = layout.get('y') + symbolHeight - 2;

      if (monozygotic === undefined) {
        // question mark
        symbol = <g className="twin" >
                    <circle r={6} cx={layout.get('x')} cy={symbolY - 4} />
                    <text x={layout.get('x') - 3} y={symbolY}>?</text>
                 </g>;
      } else if (monozygotic) {

        path.moveTo(layout.get('x') - symbolWidth, symbolY);
        path.lineTo(layout.get('x') + symbolWidth, symbolY);
      }
    }

    return (
      <g>
        <path d={path.toString()} />
        {symbol}
      </g>
    );
  }
});

module.exports = PregnancySVG;
