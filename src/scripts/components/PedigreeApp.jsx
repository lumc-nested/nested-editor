/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');


var AppStore = require('../stores/AppStore');
var AppActions = require('../actions/AppActions');

// var MemberDetails = require('./MemberDetails.jsx');
// var PedigreeWidgets = require('./PedigreeWidgets.jsx');
// var PedigreCanvas = require('./PedigreeCanvas.jsx');



function getAppState(){
  return AppStore.getData();
}


var PedigreeApp = React.createClass({

  getInitialState: function(){
    return getAppState();
  },

  _onChange: function(){
    this.setState(getAppState());
  },

  componentDidMount: function(){ 
    AppStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function(){
    AppStore.removeChangeListener(this._onChange);
  },

  handleClick: function(){
    AppActions.exampleAction('Data from View');
  },

  render: function() {
    return (
      <div className='main'>
        <p>
          Here goes the canvas.
        </p>
      </div>
    );
  }
});

module.exports = PedigreeApp;
