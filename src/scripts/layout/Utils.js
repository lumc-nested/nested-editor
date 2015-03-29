'use strict';


var Immutable = require('immutable');


var AppConfig = require('../constants/AppConfig');
var HyperGraph = require('./HyperGraph');
var LevelEngine = require('./LevelEngine');
var PositionEngine = require('./PositionEngine');

var getLayout = function(data) {

  var levelEngine = new LevelEngine();
  var positionEngine = new PositionEngine();
  var xTransform = x => x * AppConfig.MemberDistance;
  var yTransfrom = y => y * AppConfig.GenerationDistance;
  var coordinates;
  var hyperGraph;

  hyperGraph = new HyperGraph(data);
  levelEngine.determineLevels(hyperGraph);
  positionEngine.arrangePositions(hyperGraph);

  coordinates = Immutable.Map({
    members: Immutable.Map(hyperGraph.vertices)
      .map(vertex => Immutable.Map({
        x: xTransform(vertex.position),
        y: yTransfrom(vertex.level),
        index: vertex.lowerEdgeIndex
      })),
    nests: Immutable.Map(hyperGraph.hyperEdges.map(edge => [
        Immutable.Set([edge.upperLeft.id, edge.upperRight.id]),
        Immutable.Map({
          x: xTransform(edge.position),
          y: yTransfrom(edge.level),
          pregnancies: Immutable.List(edge.lowerGroups)
            .map(group => {
              var groupLayout = group.layout();
              return Immutable.Map({
                x: xTransform(groupLayout.position),
                width: xTransform(groupLayout.width)
              });
            })
        })
      ]))
  });

  console.info('layout: ', coordinates.toJS());
  return coordinates;
};

module.exports = {getLayout};
