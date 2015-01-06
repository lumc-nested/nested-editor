var React = require('react');
var PC = require('../constants/PedigreeConstants.js');
var _ = require('lodash');

var _svgID ="pedigree";

require('../../styles/pedigreeSVG.less');

function doLayout(family) {

  // TODO: fake data
  var memmberLocationProperties = [
    {id: 1, generation: 1, order: 2},
    {id: 2, generation: 1, order: 1},
    {id: 3, generation: 2, order: 1},
    {id: 4, generation: 2, order: 2}
  ];

  _.each(memmberLocationProperties, function(props) {
    props['x'] = 100 + props.order * 100;
    props['y'] = 100 + (props.generation - 1) * 150;
  });
  // end of fake data.

  var partners = [];
  var offsprings = [];

  _.each(family.nests, function(nest) {
    var f = _.find(memmberLocationProperties, {id: nest.father});
    var m = _.find(memmberLocationProperties, {id: nest.mother});

    partners.push([f['x'], f['y'], m['x'], m['y']]);

    _.each(nest.pregnancies, function(preg) {
      _.each(preg, function(child) {
        var c = _.find(memmberLocationProperties, {id: child});
        offsprings.push([
          Math.min(f['x'], m['x']) + Math.abs(m['x'] - f['x']) / 2,
          Math.min(f['y'], m['y']) + Math.abs(m['y'] - f['y']) / 2,
          c['x'],
          c['y']
        ]);
      });
    });
  });


  return {
    'locations': memmberLocationProperties,
    'partners': partners,
    'offsprings': offsprings
  };
}


var RelationshipLine = React.createClass({
  render: function() {

  }
})


var Member = React.createClass({

  render: function() {

    var shape;

    var member = this.props.data;
    var isDead = member.dateOfDeath !== undefined ||
                (member.deceased !== undefined && member.deceased);

    var DeathStrike = isDead ? <line x1="22" y1="-22" x2="-22" y2="22" /> : undefined;
    var transform = "translate(" + member.x + "," + member.y + ")";

    switch (parseInt(member.gender, 10)) {
      case 1:
        shape = <rect width="40" height="40" x="-20" y="-20" />;
        break;
      case 2:
        shape = <circle r="20" />;
        break;
      default:
        shape = <polygon points="-20,0,0,20,20,0,0,-20" />;
    }

    return (
      <g transform={transform}>
        {shape}
        {DeathStrike}
      </g>
    );
  }
});


var PedigreeSVG = React.createClass({
  render: function() {

    var layout = doLayout(this.props.family);

    var members = _.map(_.merge(this.props.family.members, layout.locations), function(member) {
      return <Member data={member} key={member.id}/>;
    });

    var partners = _.map(layout.partners, function(d) {
      return <line x1={d[0]} y1={d[1]} x2={d[2]} y2={d[3]} />
    });

    var offsprings = _.map(layout.offsprings, function(d) {

      var diffX = d[2] - d[0],
          diffY = d[3] - d[1];

      var pathString = "M" + d[0] + "," + d[1] +
                       "l" + 0 + "," + diffY / 2+
                       "l" + diffX + "," + 0 +
                       "l" + 0 + "," + diffY / 2;

      return <path d={pathString} fill="none" />;
    })

    return (
      <svg id={_svgID} width="800" height="650">
        {partners}
        {offsprings}
        {members}
        }
      </svg>
    );
  }
});

module.exports = PedigreeSVG;
