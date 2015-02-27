'use strict';


var _ = require('lodash');
var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');

var AppActions = require('../actions/AppActions.js');


var PedigreeDetails = React.createClass({
  onFormSubmit: function(pedigreeProps) {
    // Todo: Empty form fields are not in pedigreeProps and hence are not
    //   removed or deleted from the selected pedigree.
    AppActions.updatePedigree(pedigreeProps);
  },

  render: function() {
    var schema = this.props.pedigreeSchema;
    schema.properties = _.omit(schema.properties, ['members', 'nests', 'schemaExtension']);

    return <Form
             buttons={['Save']}
             schema={schema}
             validate={validate}
             values={this.props.pedigreeProps.toJS()}
             onSubmit={this.onFormSubmit}
           />;
  }
});


module.exports = PedigreeDetails;
