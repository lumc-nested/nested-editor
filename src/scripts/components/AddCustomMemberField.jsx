// Prevent including the FA stylesheet by a deep require of Icon.
var Icon = require('react-fa/lib/Icon');
var React = require('react');
var {Button, Modal} = require('react-bootstrap');
var validate = require('plexus-validate');

var DocumentActions = require('../actions/DocumentActions');

var Form = require('./forms/Form');


var AddCustomMemberField = React.createClass({
  propTypes: {
    reservedFields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onHide: React.PropTypes.func
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

    DocumentActions.addCustomMemberField(output.field, schema);
    this.props.onHide();
  },

  handleSubmit: function(e) {
    this.refs.form.handleSubmit(e);
  },

  render: function() {
    var message;
    var schema;

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
          enum: ['string', 'text', 'integer', 'number', 'boolean', 'date'],
          enumNames: ['Text', 'Multi-line text', 'Whole number', 'Any number', 'Yes / No', 'Date']
        }
      }
    };

    return (
      <Modal {...this.props}>
        <Modal.Header className="bg-primary text-primary" closeButton>
          <Modal.Title>Add field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            ref="form"
            buttons={[]}
            schema={schema}
            horizontal={true}
            validate={validate}
            onSubmit={this.onSubmit} />
        </Modal.Body>
        <Modal.Footer>
          {message}
          <Button onClick={this.props.onHide}>Close</Button>
          <Button onClick={this.handleSubmit} bsStyle="primary">Add field</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});


module.exports = AddCustomMemberField;
