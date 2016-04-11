var Immutable = require('immutable');
var React = require('react');


var NestSidebar = React.createClass({
  propTypes: {
    father: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    mother: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    // TODO: It would be convenient if the key was in the member map.
    fatherKey: React.PropTypes.string.isRequired,
    motherKey: React.PropTypes.string.isRequired
  },

  render: function() {
    return (
      <div>
        <h1>Mating</h1>
        <p>{this.props.fatherKey}</p>
        <p>{this.props.motherKey}</p>
      </div>
    );
  }
});


module.exports = NestSidebar;
