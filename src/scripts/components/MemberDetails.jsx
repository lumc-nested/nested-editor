'use strict';


var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');

var DocumentActions = require('../actions/DocumentActions');


var MemberDetails = React.createClass({
  onFormSubmit: function(fields) {
    // Todo: Empty form fields are omited.
    DocumentActions.updateMember(this.props.memberKey, fields);
  },

  getInitialState: function() {
    return {schemasJS: this.props.schemas.toJS()};
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this.props.schemas.equals(nextProps.schemas)) {
      console.log('********** serializing schemas');
      this.setState({schemasJS: nextProps.schemas.toJS()});
    }
  },

  render: function() {
    var schema = {
      title: 'Member',
      type: 'object',
      properties: this.state.schemasJS
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


module.exports = MemberDetails;
