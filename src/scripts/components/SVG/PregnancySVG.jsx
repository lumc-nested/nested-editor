'use strict';

var Immutable = require('immutable');
var React = require('react');

var AppConfig = require('../../constants/AppConfig');
var Pregnancy = require('../../common/Structures').Pregnancy;
var SVGPathBuilder = require('./SVGPathBuilder');


var PregnancySVG = React.createClass({

  propTypes: {
    data: React.PropTypes.instanceOf(Pregnancy).isRequired,
    layout: React.PropTypes.object.isRequired,
    members: React.PropTypes.object.isRequired
  },

  render: function() {
    var layout = this.props.layout;
    var pregnancy = this.props.data;
    var memberLocations = this.props.members;

    var path = new SVGPathBuilder();
    var symbol;
    var symbolWidth;
    var symbolHeight;
    var symbolY;

    var distanceToTop = AppConfig.MemberSize / 2;

    pregnancy.children.forEach(child => {
      path.moveTo(layout.get('x'), layout.get('y'));
      path.lineTo(memberLocations.getIn([child, 'x']), memberLocations.getIn([child, 'y']) - distanceToTop);
    });

    if (pregnancy.children.size > 1) {

      symbolWidth = layout.get('width') / 5 + 1;
      symbolHeight = (AppConfig.GenerationDistance - AppConfig.MemberSize / 2) / 5;
      symbolY = layout.get('y') + symbolHeight - 2;

      /*eslint-disable no-empty */

      if (Immutable.Set(pregnancy.zygotes).size === 1) {
        // Complete monozygotic pregnancy: Connect children with a horizontal line.
        path.moveTo(layout.get('x') - symbolWidth, symbolY);
        path.lineTo(layout.get('x') + symbolWidth, symbolY);
      } else if (Immutable.Set(pregnancy.zygotes).size === pregnancy.children.size) {
        // All separate zygotes: Don't draw anything.
      } else {
        // Unknown heterozygosity or too complex: Question mark.
        symbol = <g className="twin" >
                    <circle r={6} cx={layout.get('x')} cy={symbolY - 4} />
                    <text x={layout.get('x') - 3} y={symbolY}>?</text>
                 </g>;
      }

      /*eslint-enable no-empty */
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
