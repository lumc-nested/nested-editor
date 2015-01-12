/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');


var AppStore = require('../stores/AppStore');
var AppActions = require('../actions/AppActions');

var MemberDetails = require('./MemberDetails.jsx');
var Pedigree = require('./PedigreeSVG.jsx');
var Controls = require('./SVGControls.jsx');


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
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <Controls />
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <Pedigree family={this.state.data} focus={this.state.focus} />
          </div>
          <div className="col-md-4">
            <MemberDetails family={this.state.data} focus={this.state.focus} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = PedigreeApp;
