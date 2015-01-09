var React = require('react');
var AppActions = require('../actions/AppActions');

var Controls = React.createClass({
  addSpouse: function() {
    AppActions.addSpouse();
  },

  render: function() {
    return (
      <div id="svg-controls">
        <button onClick={this.addSpouse}>Add spouse</button>
      </div>
    );
  }
});


module.exports = Controls;
