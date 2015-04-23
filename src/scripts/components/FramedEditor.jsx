'use strict';


/*eslint-disable vars-on-top */
require('babel-core/polyfill');


var Frame = require('react-frame-component');
var React = require('react');

var Editor = require('./Editor');


// Inject style manually in the IFrame (don't use style-loader).
var style = require('!css-loader!less-loader!../../styles/main-framed.less');


var FramedEditor = React.createClass({

  propTypes: {
    style: React.PropTypes.object
  },

  openDocument: function(document, filetype) {
    this.refs.editor.openDocument(document, filetype);
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
      <Frame style={this.props.style} head={head} initialSrc={initialSrc}>
        <Editor ref="editor" />
      </Frame>
    );
  }
});


module.exports = FramedEditor;
