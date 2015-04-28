var React = require('react');

var normalizer = require('plexus-form/lib/fields/utils/normalizer');
var parser = require('plexus-form/lib/fields/utils/parser');


/**
 * Bootstrapified plexus-form `SelectionField`. Only significant change is
 * setting `className`.
 */
var SelectionField = React.createClass({
  normalize: function(text) {
    // XXXXX: assume string in case type isn't set
    var type = this.props.type || 'string';

    return normalizer[type](text);
  },

  parse: function(text) {
    // XXXXX: assume string in case type isn't set
    var type = this.props.type || 'string';

    return parser[type](text);
  },

  handleChange: function(event) {
    var val = this.normalize(event.target.value);
    this.props.update(this.props.path, val, this.parse(val));
  },

  render: function() {
    var values = this.props.schema.enum;
    var names = this.props.schema.enumNames || values;
    var options = values.map(
      (opt, i) => <option key={opt} value={opt}>{names[i] || opt}</option>
    );

    return (
      <select className="form-control"
              name={this.props.label}
              value={this.props.value || values[0]}
              onChange={this.handleChange}>
        {options}
      </select>
    );
  }
});


module.exports = SelectionField;
