'use strict';


var _ = require('lodash');
var React = require('react');
var Form = require('plexus-form');
var validate = require('plexus-validate');

var AppActions = require('../actions/AppActions.js');

var schema = require('../../schema.json');


var MemberDetails = React.createClass({
  getInitialState: function() {
    var individualSchema = schema.definitions.individual;

    return {
      schema: _.assign(individualSchema, {
        'properties': _.omit(individualSchema.properties, '_id')
      })
    };
  },

  onFormSubmit: function(data) {
    // Todo: Empty form fields are not in data and hence are not removed or
    //   deleted from the selected member.
    AppActions.updateMember(data);
  },

  render: function() {
    var member = this.props.member;

    if (member === undefined) {
      return <div id="member-details"><p>No member selected</p></div>;
    }

    return (
      <div id="member-details">
        <Form
          buttons={['Save']}
          schema={this.state.schema}
          validate={validate}
          values={member.toJS()}
          onSubmit={this.onFormSubmit}
        />
      </div>
    );
  }
});


module.exports = MemberDetails;
