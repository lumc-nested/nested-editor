'use strict';

var React = require('react');
var PC = require('../constants/PedigreeConstants.js');
var AppActions = require('../actions/AppActions.js');
var _ = require('lodash');

var _svgID ="pedigree";

require('../../styles/pedigreeSVG.less');

function doLayout(family) {

  // 1. loop through all nests and determin generation sequence.
  var generations = [[]];
  _.each(family.nests, function(nest){
    var parents = [nest.father, nest.mother];
    var children = _.flatten(nest.pregnancies);

    var parentGenerationIndex = _.max(_.map(generations, function(current, index) {
      if (_.intersection(parents, current).length > 0) {
        return index;
      }

      if (_.intersection(children, current).length > 0) {
        return index - 1;
      }

      return -1;
    }));

    // TODO: insert members in the correct order.
    if (parentGenerationIndex === -1) {
      // no match
      generations.splice(0, 0, parents); // insert parent generation.
      // TODO:
      generations[1] = _.union(generations[1], children); // update child generation.
    } else {
      // found parents in the known generations.

      // update parent generation.
      // TODO: handle member with multiple partners.
      var fatherIndex, motherIndex;
      fatherIndex = generations[parentGenerationIndex].indexOf(nest.father);
      if (fatherIndex >= 0) {
        generations[parentGenerationIndex].splice(fatherIndex + 1, 0, nest.mother);
      } else {
        motherIndex = generations[parentGenerationIndex].indexOf(nest.mother);
        generations[parentGenerationIndex].splice( motherIndex, 0, nest.father);
      }

      // TODO:
      generations[parentGenerationIndex + 1] = _.union(generations[parentGenerationIndex + 1], children); // update child generation.
    }
  });

  // 2. determine member locationgs based on its order in a generation.
  var locations = [];
  _.each(generations, function(gen, i) {
    _.each(gen, function(p, j) {
      // TODO: Current approach is too naive.
      locations.push({
        id: p,
        x: 100 + j * PC.SiblingDistance,
        y: 100 + i * PC.GenerationDistance
      });
    });
  });

  // 3. determine connections between members based on members' locations and the type of relationship.
  var partners = [];
  var offsprings = [];

  _.each(family.nests, function(nest) {
    var f = _.find(locations, {id: nest.father});
    var m = _.find(locations, {id: nest.mother});

    partners.push([f.x, f.y, m.x, m.y]);

    _.each(nest.pregnancies, function(preg) {
      _.each(preg, function(child) {
        var c = _.find(locations, {id: child});
        offsprings.push([
          Math.min(f.x, m.x) + Math.abs(m.x - f.x) / 2,
          Math.min(f.y, m.y) + Math.abs(m.y - f.y) / 2,
          c.x,
          c.y
        ]);
      });
    });
  });


  return {
    'generations': generations,
    'locations': locations,
    'partners': partners,
    'offsprings': offsprings
  };
}


var Member = React.createClass({

  render: function() {

    var shape;

    var member = this.props.data;
    var isDead = member.dateOfDeath !== undefined ||
                (member.deceased !== undefined && member.deceased);

    var death = isDead ? <line x1="25" y1="-25" x2="-25" y2="25" /> : undefined;
    var transform = "translate(" + member.x + "," + member.y + ")";

    // TODO: how to detect pregnancies not carried to terms? The triangle shape.

    switch (member.gender) {
      case 1:
        shape = <rect width="36" height="36" x="-18" y="-18" />;
        break;
      case 2:
        shape = <circle r="20" />;
        break;
      default:
        shape = <polygon points="-20,0,0,20,20,0,0,-20" />;
    }

    return (
      <g transform={transform} onClick={this.handleClick} className={this.props.focused ? "focus" : ""} >
        {shape}
        {death}
      </g>
    );
  },

  handleClick: function() {
    AppActions.changeFocus(this.props.data.id);
  }
});


var PedigreeSVG = React.createClass({
  render: function() {

    var layout = doLayout(this.props.family);
    console.log(layout);

    var members = _.map(this.props.family.members, function(member) {
      _.extend(member, _.find(layout.locations, {id: member.id}));
      return <Member data={member} focused={this.props.focus === member.id} key={member.id}/>;
    }, this);

    var partners = _.map(layout.partners, function(d) {
      return <line x1={d[0]} y1={d[1]} x2={d[2]} y2={d[3]} />;
    });

    var offsprings = _.map(layout.offsprings, function(d) {

      var diffX = d[2] - d[0],
          diffY = d[3] - d[1];

      var pathString = "M" + d[0] + "," + d[1] +    // start position
                       "l" + 0 + "," + diffY / 2 +  // line of desent
                       "l" + diffX + "," + 0 +      // sibship line
                       "l" + 0 + "," + diffY / 2;   // individual's line

      return <path d={pathString} />;
    });

    return (
      <svg id={_svgID} width="800" height="650">
        {partners}
        {offsprings}
        {members}
      </svg>
    );
  }
});

module.exports = PedigreeSVG;
