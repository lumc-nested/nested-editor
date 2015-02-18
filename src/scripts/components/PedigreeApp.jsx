/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react');
var _ = require('lodash');


var AppStore = require('../stores/AppStore');
var PC = require('../constants/PedigreeConstants');

var MemberDetails = require('./MemberDetails.jsx');
var Pedigree = require('./PedigreeSVG.jsx');
var Controls = require('./SVGControls.jsx');


var getAppState = function() {
  return AppStore.getData();
};


var PedigreeApp = React.createClass({

  getInitialState: function() {
    return getAppState();
  },

  _onChange: function() {
    this.setState(getAppState());
  },

  componentDidMount: function() {
    AppStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },

  render: function() {
    var selectedMember;
    console.log(this.state);

    if (this.state.focus !== undefined &&
        this.state.focus.level === PC.FocusLevel.Member &&
        this.state.pedigree) {
      selectedMember = _.find(this.state.pedigree.members, {'_id': this.state.focus.key});
    }

    return (
      <div className='container'>
        <div className='row'>
          <div className='col-md-12'>
            <Controls focus={this.state.focus} />
          </div>
        </div>
        <div className='row'>
          <div className='col-md-8'>
            <Pedigree pedigree={this.state.pedigree} focus={this.state.focus} />
          </div>
          <div className='col-md-4'>
            <MemberDetails selected={selectedMember} />
          </div>
        </div>
      </div>
    );
  }
});


module.exports = PedigreeApp;
