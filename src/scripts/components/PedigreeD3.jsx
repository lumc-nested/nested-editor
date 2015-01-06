var React = require('react');
//var Snap = require('snapsvg');
var d3 = require('d3');
var _ = require('lodash');

var _svgID, _svg, memmberLocationProperties;
_svgID = 'pedigree-canvas';

function doLayout(family) {

  // TODO: fake data
  var memmberLocationProperties = {
    '1': {generation: 1, order: 1},
    '2': {generation: 1, order: 2},
    '3': {generation: 2, order: 0},
    '4': {generation: 2, order: 2},
    '5': {generation: 2, order: 3}
  };

  _.each(memmberLocationProperties, function(props) {
    props['x'] = 100 + props.order * 100;
    props['y'] = 100 + (props.generation - 1) * 150;
  });

  return memmberLocationProperties;
}


var PedigreeD3 = React.createClass({

  componentDidMount: function(){
    console.log("here");
    _svg = d3.select("#" + _svgID);
    memmberLocationProperties = doLayout(this.props.family);

    var partners = [];
    var offsprings = [];

    _.each(this.props.family.nests, function(nest) {
      var f = memmberLocationProperties[nest.father];
      var m = memmberLocationProperties[nest.mother];

      partners.push([f['x'], f['y'], m['x'], m['y']]);

      _.each(nest.pregnancies, function(preg) {
        _.each(preg, function(child) {
          var c = memmberLocationProperties[child];
          offsprings.push([
            Math.min(f['x'], m['x']) + Math.abs(m['x'] - f['x']) / 2,
            Math.min(f['y'], m['y']) + Math.abs(m['y'] - f['y']) / 2,
            c['x'],
            c['y']
          ]);
        });
      });
    });

    // draw partner lines.
    _svg.selectAll()
      .data(partners)
      .enter()
      .append("line")
      .attr("x1", function(d) { return d[0]; })
      .attr("y1", function(d) { return d[1]; })
      .attr("x2", function(d) { return d[2]; })
      .attr("y2", function(d) { return d[3]; })
      .style("stroke", "indigo")
      .style("stroke-width", 2);

    // draw offspring lines.
     _svg.selectAll()
      .data(offsprings)
      .enter()
      .append("path")
      .attr("d", function(offspring) {
        console.log(offspring);

        var diffX = offspring[2] - offspring[0],
            diffY = offspring[3] - offspring[1];

        var pathString = "M" + offspring[0] + "," + offspring[1] +
                         "l" + 0 + "," + diffY / 2+
                         "l" + diffX + "," + 0 +
                         "l" + 0 + "," + diffY / 2;

        // var x = [offspring[0], offspring[2], offspring[2]];
        // var y = [offspring[1] + 75, offspring[1] + 75, offspring[3]];
        // _.each(_.range(3), function(i) {
        //   pathString += "L" + x[i] + "," + y[i];
        // });

        return pathString;

      })
      .style("stroke", "indigo")
      .style("stroke-width", 2)
      .style("fill", "transparent");

    // draw members.
    var members = _svg.selectAll()
      .data(this.props.family.members)
      .enter()
      .append("g")
      .attr("id", function(d) { return "member-" + d.id; })
      .attr("transform", function(d, i) {
        return "translate(" + memmberLocationProperties[d.id].x + ", " + memmberLocationProperties[d.id].y + ")";
      });

    members.append(function(d) {
      switch(d.gender) {
        case 1:
          return document.createElementNS(d3.ns.prefix.svg, "rect");
          break;
        case 2:
          return document.createElementNS(d3.ns.prefix.svg, "circle");
          break;
        default:
          return document.createElementNS(d3.ns.prefix.svg, "polygon");
          break;
      }
    }).attr("class", "member")
      .style("fill", "#fff")
      .style("stroke", "indigo")
      .style("stroke-width", 2);

    members.selectAll("circle")
      .attr("r", 20);

    members.selectAll("rect")
      .attr("x", "-20")
      .attr("y", "-20")
      .attr("width", 40)
      .attr("height", 40);

    members.selectAll("polygon")
      .attr("points", "-20, 0, 0, 20, 20, 0, 0, -20");
  },

  render: function() {
    return (
      <svg id={_svgID} width="800" height="650" />
    );
  }
});

module.exports = PedigreeD3;
