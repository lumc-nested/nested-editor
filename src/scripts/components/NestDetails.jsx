'use strict';


var _ = require('lodash');
var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');

var DocumentActions = require('../actions/DocumentActions');


var NestDetails = React.createClass({
  onFormSubmit: function(fields) {
    // Todo: Empty form fields are omited.
    DocumentActions.updateNest(this.props.nestKey, fields);
  },

  render: function() {
    var schema = this.props.schema;
    schema.properties = _.omit(schema.properties, ['pregnancies']);

    return <Form
             buttons={['Save']}
             schema={schema}
             validate={validate}
             values={this.props.fields.toJS()}
             onSubmit={this.onFormSubmit}
           />;
  }
});


module.exports = NestDetails;
