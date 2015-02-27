'use strict';


var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');

var AppActions = require('../actions/AppActions.js');


var NestDetails = React.createClass({
  onFormSubmit: function(nestProps) {
    // Todo: Empty form fields are not in nestProps and hence are not
    //   removed or deleted from the selected nest.
    AppActions.updateNest(nestProps);
  },

  render: function() {
    var schema = this.props.nestSchema;
    schema.properties = _.omit(schema.properties, ['pregnancies']);

    return <Form
             buttons={['Save']}
             schema={schema}
             validate={validate}
             values={this.props.nestProps.toJS()}
             onSubmit={this.onFormSubmit}
           />;
  }
});


module.exports = NestDetails;
