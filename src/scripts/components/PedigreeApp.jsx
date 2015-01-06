/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');


var AppStore = require('../stores/AppStore');
var AppActions = require('../actions/AppActions');

// var MemberDetails = require('./MemberDetails.jsx');
// var PedigreeWidgets = require('./PedigreeWidgets.jsx');
// var Pedigree = require('./PedigreeCanvas.jsx');
// var Pedigree = require('./PedigreeD3.jsx');
// var Pedigree = require('./PedigreeSnap.jsx');
var Pedigree = require('./PedigreeSVG.jsx');


function getAppState(){
  return AppStore.getData();
}


var PedigreeApp = React.createClass({

  getInitialState: function(){
    return getAppState();
  },

  _onChange: function(){
    this.setState(getAppState());
    console.log(this.state);
  },

  componentDidMount: function(){ 
    AppStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function(){
    AppStore.removeChangeListener(this._onChange);
  },

  render: function() {
    return (
      <div className='main'>
        <Pedigree family={this.state.data.family} focus={this.state.focus} />
      </div>
    );
  }
});

module.exports = PedigreeApp;
