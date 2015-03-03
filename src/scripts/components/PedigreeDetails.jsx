'use strict';


var _ = require('lodash');
var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');

var DocumentActions = require('../actions/DocumentActions');


var PedigreeDetails = React.createClass({
  onFormSubmit: function(fields) {
    // Todo: Empty form fields are omited.
    DocumentActions.updatePedigree(fields);
  },

  render: function() {
    var schema = {
      title: 'Pedigree',
      type: 'object',
      properties: this.props.schemas.toJS()
    };
    return <Form
             buttons={['Save']}
             schema={schema}
             validate={validate}
             values={this.props.fields.toJS()}
             onSubmit={this.onFormSubmit}
           />;
  }
});


module.exports = PedigreeDetails;
