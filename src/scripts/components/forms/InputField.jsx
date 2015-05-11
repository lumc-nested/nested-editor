var React = require('react');


/**
 * Bootstrapified plexus-form `InputField`. Only significant change is
 * setting `className`.
 */
var InputField = React.createClass({
  onChange: function(event) {
    this.props.onChange(event.target.value);
  },

  render: function() {
    return <input
      type="text"
      className="form-control"
      value={this.props.value}
      onKeyPress={this.props.onKeyPress}
      onChange={this.onChange} />;
  }
});


module.exports = InputField;
