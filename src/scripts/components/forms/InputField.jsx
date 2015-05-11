var React = require('react');

var normalizer = require('plexus-form/lib/fields/utils/normalizer');
var parser = require('plexus-form/lib/fields/utils/parser');


/**
 * Bootstrapified plexus-form `InputField`. Only significant change is
 * setting `className`.
 */
var InputField = React.createClass({
  normalize: function(text) {
    return normalizer[this.props.type](text);
  },

  parse: function(text) {
    return parser[this.props.type](text);
  },

  handleChange: function(event) {
    var text = this.normalize(event.target.value);
    this.props.update(this.props.path, text, this.parse(text));
  },

  handleKeyPress: function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  },

  render: function() {
    return <input
      type="text"
      className="form-control"
      name={this.props.label}
      value={this.props.value || ''}
      onKeyPress={this.handleKeyPress}
      onChange={this.handleChange} />;
  }
});


module.exports = InputField;
