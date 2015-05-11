var React = require('react');


/**
 * Bootstrapified plexus-form `SelectionField`. Only significant change is
 * setting `className`.
 */
var SelectionField = React.createClass({
  onChange: function(event) {
    this.props.onChange(event.target.value);
  },

  render: function() {
    var values = this.props.schema.enum;
    var names = this.props.schema.enumNames || values;
    var options = values.map(
      (opt, i) => <option key={opt} value={opt}>{names[i] || opt}</option>
    );

    return (
      <select className="form-control"
              value={this.props.value || values[0]}
              onChange={this.onChange}>
        {options}
      </select>
    );
  }
});


module.exports = SelectionField;
