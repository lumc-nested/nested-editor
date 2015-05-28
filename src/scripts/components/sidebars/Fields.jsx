// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var Immutable = require('immutable');
var React = require('react');
var {Button, OverlayTrigger, Tooltip} = require('react-bootstrap');
var validate = require('plexus-validate');

var DocumentActions = require('../../actions/DocumentActions');
var {ObjectRef} = require('../../common/Structures');
var AppConstants = require('../../constants/AppConstants');
var Form = require('../forms/Form');


var FieldsSidebar = React.createClass({
  propTypes: {
    objectRef: React.PropTypes.instanceOf(ObjectRef).isRequired,
    schemas: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    showSchemas: React.PropTypes.func.isRequired
  },

  contextTypes: {
    showMessage: React.PropTypes.func.isRequired
  },

  shouldComponentUpdate: function(nextProps) {
    var is = Immutable.is;
    var props = this.props;

    // Compare all props, except for the `showSchemas` callback.
    return !is(props.objectRef, nextProps.objectRef) ||
           !is(props.schemas, nextProps.schemas) ||
           !is(props.fields, nextProps.fields);
  },

  onSubmit: function(output, value, errors) {
    if (Object.keys(errors).length) {
      this.context.showMessage('Please correct all errors in the form.');
      return;
    }
    DocumentActions.updateFields(this.props.objectRef, output);
  },

  render: function() {
    var button;
    var schema;
    var title;

    schema = {
      type: 'object',
      properties: this.props.schemas.toJS()
    };

    switch (this.props.objectRef.type) {
      case AppConstants.ObjectType.Member:
        title = 'Member';
        break;
      case AppConstants.ObjectType.Nest:
        title = 'Nest';
        break;
      case AppConstants.ObjectType.Pedigree:
      default:
        title = 'Pedigree';
    }

    button = (submit) =>
      <Button onClick={submit} bsStyle="primary" className="pull-right">Save fields</Button>;

    // When using the `values` prop on `Form`, it's important to implement a
    // smart `shouldComponentUpdate`. Otherwise, form state by the user will
    // be destroyed by rendering.

    return (
      <div>
        <h1>
          {title}
          <OverlayTrigger placement="left" overlay={<Tooltip>Manage custom fields</Tooltip>}>
            <a onClick={this.props.showSchemas} className="pull-right">
              <Icon name="pencil" />
            </a>
          </OverlayTrigger>
        </h1>
        <Form
          buttons={button}
          schema={schema}
          validate={validate}
          values={this.props.fields.toJS()}
          onSubmit={this.onSubmit} />
      </div>
    );
  }
});


module.exports = FieldsSidebar;
