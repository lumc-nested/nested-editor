var React = require('react');


var errorClass = function(errors) {
  if (!errors || errors.length === 0) {
    return '';
  }
  return 'has-error';
};


var makeTitle = function(description, errors) {
  var parts = [];
  if (description && description.length > 0) {
    parts.push(description);
  }
  if (errors && errors.length > 0) {
    parts.push(errors.join('\n'));
  }
  return parts.join('\n\n');
};


/**
 * Bootstrapified plexus-form `FieldWrapper`. Changes are DOM structure and
 * classnames. They depend on the wrapped field type and therefore needs the
 * `schema` prop. This currently depends on a patched version of plexus-form,
 * which by default doesn't pass the schema.
 */
var FieldWrapper = React.createClass({
  contextTypes: {
    horizontal: React.PropTypes.bool.isRequired
  },

  render: function() {
    var classes = [].concat(errorClass(this.props.errors) || [],
                            'form-element',
                            this.props.classes || []);

    if (this.props.schema.type === 'boolean') {
      classes.push('checkbox');
      return (
        <div className={classes.join(' ')}
             key={this.props.label}
             title={makeTitle(this.props.description, this.props.errors)}>
          <label>{this.props.children} {this.props.title}</label>
        </div>
      );
    } else {
      classes.push('form-group');
      return (
        <div className={classes.join(' ')}
             key={this.props.label}
             title={makeTitle(this.props.description, this.props.errors)}>
          <label htmlFor={this.props.label}
                 className={this.context.horizontal ? 'control-label col-xs-2' : 'control-label'}>
            {this.props.title}
          </label>
          <div className={this.context.horizontal ? 'col-xs-10' : ''}>
            {this.props.children}
          </div>
        </div>
      );
    }
  }
});


module.exports = FieldWrapper;
