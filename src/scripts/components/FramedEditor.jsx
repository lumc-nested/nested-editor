'use strict';


var Frame = require('react-frame-component');
var React = require('react');

var DocumentActions = require('../actions/DocumentActions');

var ExcelReader = require('../readers/ExcelReader');
var FamReader = require('../readers/FamReader');
var JsonReader = require('../readers/JsonReader');
var PedReader = require('../readers/PedReader');

var Editor = require('./Editor');


// Inject style manually in the IFrame (don't use style-loader).
var style = require('!css-loader!less-loader!../../styles/main.less');


// [{a: 1, b: [x, y]},
//  {a: 2, b: [z]}]
// =>
// {x: {a: 1, b: [x, y]},
//  y: {a: 1, b: [x, y]},
//  z: {a: 2, b: [z]}}
var indexByArray = function(objects, property) {
  var byArray = {};
  var i;
  var j;

  for (i = 0; i < objects.length; i++) {
    for (j = 0; j < objects[i][property].length; j++) {
      byArray[objects[i][property][j]] = objects[i];
    }
  }

  return byArray;
};


var readers = indexByArray([ExcelReader, FamReader, JsonReader, PedReader], 'accept');


var FramedEditor = React.createClass({
  openDocument: function(document, filetype) {
    DocumentActions.openDocument(readers[filetype].readString(document));
  },

  render: function() {
    var head = [
      <base key="base" href={document.baseURI} />,
      <style key="style" type="text/css" dangerouslySetInnerHTML={{__html: style.toString()}} />
    ];

    /*eslint-disable no-script-url */
    var initialSrc = 'javascript:"<!DOCTYPE html><html><body></body></html>"';
    /*eslint-enable */

    return (
      <Frame head={head} initialSrc={initialSrc}>
        <Editor />
      </Frame>
    );
  }
});


module.exports = FramedEditor;
