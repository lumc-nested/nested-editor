'use strict';


var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');

var DocumentActions = require('../actions/DocumentActions');


var createJsonSchema = function(fieldDefinitions) {
  return {
    title: 'Pedigree',
    type: 'object',
    properties: fieldDefinitions.toJS()
  };
};


var PedigreeDetails = React.createClass({
  onFormSubmit: function(fields) {
    // Todo: Empty form fields are omited.
    DocumentActions.updatePedigree(fields);
  },

  getInitialState: function() {
    var jsonSchema = createJsonSchema(this.props.fieldDefinitions);
    return {jsonSchema};
  },

  componentWillReceiveProps: function(nextProps) {
    var jsonSchema;
    if (!this.props.fieldDefinitions.equals(nextProps.fieldDefinitions)) {
      console.log('********** serializing schema');
      jsonSchema = createJsonSchema(nextProps.fieldDefinitions);
      this.setState({jsonSchema});
    }
  },

  render: function() {
    return <Form
             buttons={['Save']}
             schema={this.state.jsonSchema}
             validate={validate}
             values={this.props.fields.toJS()}
             onSubmit={this.onFormSubmit}
           />;
  }
});


module.exports = PedigreeDetails;
