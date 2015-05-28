var React = require('react');


var TextareaField = React.createClass({
  onChange: function(event) {
    this.props.onChange(event.target.value);
  },

  onKeyPress: function(event) {
    /**
     * The onKeyPress prop captures the <enter> key event. This prevents us
     * from entering multiline values, so we don't call it here. We also have
     * to prevent the event on the form, since it will submit the form
     * (depending on its enterKeySubmits prop).
     */
    // return this.props.onKeyPress(event);
    event.stopPropagation();
  },

  render: function() {
    return <textarea
      className="form-control"
      value={this.props.value}
      onKeyPress={this.onKeyPress}
      onChange={this.onChange}
      rows="3" />;
  }
});


module.exports = TextareaField;
