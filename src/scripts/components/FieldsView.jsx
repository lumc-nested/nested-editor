'use strict';


var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');


var createJsonSchema = function(title, fieldDefinitions) {
  return {
    title: title,
    type: 'object',
    properties: fieldDefinitions.toJS()
  };
};


var FieldsView = React.createClass({
  getInitialState: function() {
    var jsonSchema = createJsonSchema(this.props.title, this.props.fieldDefinitions);
    return {jsonSchema};
  },

  componentWillReceiveProps: function(nextProps) {
    var jsonSchema;
    if (!this.props.fieldDefinitions.equals(nextProps.fieldDefinitions)) {
      console.log('********** serializing schema');
      jsonSchema = createJsonSchema(nextProps.title, nextProps.fieldDefinitions);
      this.setState({jsonSchema});
    }
  },

  render: function() {
    return <Form
             buttons={['Save']}
             schema={this.state.jsonSchema}
             validate={validate}
             values={this.props.fields.toJS()}
             onSubmit={this.props.onSubmit}
           />;
  }
});


module.exports = FieldsView;
