'use strict';


var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');

var AppActions = require('../actions/AppActions.js');


var MemberDetails = React.createClass({
  onFormSubmit: function(memberProps) {
    // Todo: Empty form fields are not in memberProps and hence are not
    //   removed or deleted from the selected member.
    AppActions.updateMember(memberProps);
  },

  render: function() {
    return <Form
             buttons={['Save']}
             schema={this.props.memberSchema}
             validate={validate}
             values={this.props.memberProps.toJS()}
             onSubmit={this.onFormSubmit}
           />;
  }
});


module.exports = MemberDetails;
