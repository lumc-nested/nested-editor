'use strict';


var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');

var AppActions = require('../actions/AppActions.js');


var MemberDetails = React.createClass({
  onFormSubmit: function(data) {
    // Todo: Empty form fields are not in data and hence are not removed or
    //   deleted from the selected member.
    AppActions.updateMember(data);
  },

  render: function() {
    if (this.props.member === undefined) {
      return <div id="member-details"><p>No member selected</p></div>;
    }

    return (
      <div id="member-details">
        <Form
          buttons={['Save']}
          schema={this.props.schema}
          validate={validate}
          values={this.props.member.toJS()}
          onSubmit={this.onFormSubmit}
        />
      </div>
    );
  }
});


module.exports = MemberDetails;
