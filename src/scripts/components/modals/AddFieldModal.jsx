// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var React = require('react');
var {Button, Modal} = require('react-bootstrap');
var validate = require('plexus-validate');

var AppConstants = require('../../constants/AppConstants');
var DocumentActions = require('../../actions/DocumentActions');

var Form = require('../forms/Form');


var AddFieldModal = React.createClass({
  propTypes: {
    objectType: React.PropTypes.number.isRequired,
    onRequestHide: React.PropTypes.func,
    reservedFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  getInitialState: function() {
    return {message: undefined};
  },

  componentWillUnmount: function() {
    clearTimeout(this.messageTimeout);
  },

  showMessage: function(message) {
    this.setState({message});
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => this.setState({message: undefined}), 3000);
  },

  onSubmit: function(output, value, errors) {
    var schema;

    if (Object.keys(errors).length) {
      this.showMessage('Please correct all errors in the form.');
      return;
    }

    if (this.props.reservedFields.includes(output.field)) {
      this.showMessage('Field already exist, please choose another name.');
      return;
    }

    schema = {
      title: output.field,
      type: output.type
    };

    if (output.type === 'date') {
      schema.type = 'string';
      schema.format = 'date';
    }

    if (output.type === 'text') {
      schema.type = 'string';
      schema.format = 'multiline';
    }

    DocumentActions.addField(
      this.props.objectType,
      output.field,
      schema
    );

    this.props.onRequestHide();
  },

  handleSubmit: function(e) {
    this.refs.form.handleSubmit(e);
  },

  render: function() {
    var message;
    var schema;
    var title;

    switch (this.props.objectType) {
      case AppConstants.ObjectType.Member:
        title = 'Add member field';
        break;
      case AppConstants.ObjectType.Nest:
        title = 'Add nest field';
        break;
      case AppConstants.ObjectType.Pedigree:
      default:
        title = 'Add pedigree field';
    }

    if (this.state.message) {
      message = (
        <span className="text-danger pull-left message">
          <Icon name="exclamation-triangle" /> {this.state.message}
        </span>
      );
    }

    schema = {
      type: 'object',
      required: ['field'],
      'x-ordering': ['field', 'type'],
      properties: {
        field: {
          title: 'Field',
          description: 'Name of the field',
          type: 'string'
        },
        type: {
          title: 'Value',
          description: 'Allowed values for the field',
          type: 'string',
          'enum': ['string', 'text', 'integer', 'number', 'boolean', 'date'],
          enumNames: ['Text', 'Multi-line text', 'Whole number', 'Any number', 'Yes / No', 'Date']
        }
      }
    };

    return (
      <Modal {...this.props} bsStyle="primary" title={title}>
        <div className="modal-body">
          <Form
            ref="form"
            buttons={[]}
            schema={schema}
            horizontal={true}
            validate={validate}
            onSubmit={this.onSubmit} />
        </div>
        <div className="modal-footer">
          {message}
          <Button onClick={this.props.onRequestHide}>Close</Button>
          <Button onClick={this.handleSubmit} bsStyle="primary">Add field</Button>
        </div>
      </Modal>
    );
  }
});


module.exports = AddFieldModal;
