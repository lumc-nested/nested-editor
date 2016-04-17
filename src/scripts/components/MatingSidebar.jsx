var Immutable = require('immutable');
var React = require('react');


var MatingSidebar = React.createClass({
  propTypes: {
    father: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    mother: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    // TODO: It would be convenient if the key was in the individual map.
    fatherKey: React.PropTypes.string.isRequired,
    motherKey: React.PropTypes.string.isRequired
  },

  render: function() {
    return (
      <div>
        <h1>Mating</h1>
        <p>Father: {this.props.father.get('name') || this.props.fatherKey}</p>
        <p>Mother: {this.props.mother.get('name') || this.props.motherKey}</p>
      </div>
    );
  }
});


module.exports = MatingSidebar;
