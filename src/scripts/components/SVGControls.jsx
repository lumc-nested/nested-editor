'use strict';

var React = require('react');
var AppActions = require('../actions/AppActions');

// CSS
require('../../styles/svgControls.less');

var Controls = React.createClass({
  addSpouse: function() {
    AppActions.addSpouse();
  },

  render: function() {
    var buttons = [];

    if (typeof this.props.selected !== 'undefined') {
      buttons.push(
        <button type="button" className="btn btn-default" onClick={this.addSpouse}>Add spouse</button>
      );
    }

    return (
      <div id="svg-controls">
        <div className="btn-group" role="group" aria-label="..." >
          {buttons}
        </div>
      </div>
    );
  }
});


module.exports = Controls;
