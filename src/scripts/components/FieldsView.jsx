'use strict';


var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');


var FieldsView = React.createClass({

  propTypes: {
    fieldDefinitions: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    var properties = this.props.fieldDefinitions.toJS();
    return {properties};
  },

  componentWillReceiveProps: function(nextProps) {
    var properties;
    if (!this.props.fieldDefinitions.equals(nextProps.fieldDefinitions)) {
      console.log('********** serializing schema');
      properties = nextProps.fieldDefinitions.toJS();
      this.setState({properties});
    }
  },

  render: function() {

    var jsonSchema = {
      title: this.props.title,
      type: 'object',
      properties: this.state.properties
    };

    return <Form
             buttons={['Save']}
             schema={jsonSchema}
             validate={validate}
             values={this.props.fields.toJS()}
             onSubmit={this.props.onSubmit} />;
  }
});


module.exports = FieldsView;
