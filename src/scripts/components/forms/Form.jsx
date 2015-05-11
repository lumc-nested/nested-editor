var PlexusForm = require('plexus-form');
var React = require('react');

var FieldWrapper = require('./FieldWrapper');
var SectionWrapper = require('./SectionWrapper');

var DateField = require('./DateField');
var InputField = require('./InputField');
var SelectionField = require('./SelectionField');


/**
 * Bootstrapified wrapper around plexus-form. Interface should be the same,
 * with the addition of the `horizontal` prop.
 *
 * It works by setting custom input components for all relevant fields in the
 * schema (as a `x-hints/form/inputComponent` schema property).
 *
 * It depends on a slightly patched version of plexus-form:
 *
 * 1. Wrapper components need the wrapped field schema.
 * 2. Custom input components should not be wrapped in `UserDefinedField`.
 */
var Form = React.createClass({
  propTypes: {
    horizontal: React.PropTypes.bool.isRequired
  },

  childContextTypes: {
    horizontal: React.PropTypes.bool.isRequired
  },

  getDefaultProps: function() {
    return {horizontal: false};
  },

  getChildContext: function() {
    return {horizontal: this.props.horizontal};
  },

  handleSubmit: function(event) {
    return this.refs.form.handleSubmit(event);
  },

  render: function() {
    var {horizontal, schema, ...restProps} = this.props;
    var handlers = {
      date: DateField,
      input: InputField,
      selection: SelectionField
    };

    Object.keys(schema.properties).forEach(field => {
      var fieldSchema = schema.properties[field];
      var setComponent = component => {
        // TODO: Merge in case there already are hints.
        fieldSchema['x-hints'] = {form: {inputComponent: component}};
      };

      if (fieldSchema.enum) {
        setComponent('selection');
      } else if (fieldSchema.format === 'date') {
        setComponent('date');
      } else if (!['boolean', 'object', 'array'].includes(fieldSchema.type)) {
        setComponent('input');
      }
    });

    return <PlexusForm
      ref="form"
      {...restProps}
      sectionWrapper={SectionWrapper}
      fieldWrapper={FieldWrapper}
      handlers={handlers}
      className={horizontal ? 'form-horizontal':''}
      schema={schema} />;
  }
});


module.exports = Form;
