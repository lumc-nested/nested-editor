'use strict';

var React = require('react');
var Kinetic = require('kinetic');

var _stage, _layer;

var PedigreeCanvas = React.createClass({

    componentDidMount: function() {
        var _stage = new Kinetic.Stage({
            width: 650,
            height: 650,
            container: 'pedigree-canvas',
            fill: 'white'
        });

        var _layer = new Kinetic.Layer({});

        var circle = new Kinetic.Circle({
            x: 100, 
            y: 100,
            radius: 20,
            stroke: 'indigo'
        });

        _layer.add(circle);
        _stage.add(_layer);
    },

    render: function() {
        return (
            <div id="pedigree-canvas">
            </div>
        );
    }

});

module.exports = PedigreeCanvas;

