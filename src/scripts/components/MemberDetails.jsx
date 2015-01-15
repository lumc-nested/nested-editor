'use strict';

var React = require('react');
var validate = require('plexus-validate');
var Form = require('plexus-form');
var _ = require('lodash');

var schema = require('../../schema.json');

var _detailsID = 'member-details';

var MemberDetails = React.createClass({
  getSelected: function() {
    return _.find(this.props.pedigree.members, function(member) {
      return member._id === this.props.focus;
    }, this);
  },

  getInitialState: function() {
    var individual_schema = schema.definitions.individual;

    return {
      schema: _.assign(individual_schema, {
        "properties": _.omit(individual_schema.properties, "_id")
      })
    };
  },

  onFormSubmit: function(data, value, errors) {
    // Todo: Empty form fields are not in data and hence are not removed or
    //   deleted from the selected member.
    _.assign(this.getSelected(), data);
  },

  render: function() {
    var selected = this.getSelected();

    if (selected === undefined) {
      return <div id={_detailsID}><p>No member selected</p></div>;
    }

    return (
      <div id={_detailsID}>
        <Form
          buttons={['Save']}
          schema={this.state.schema}
          validate={validate}
          values={selected}
          onSubmit={this.onFormSubmit}
        />
      </div>
    );
  }
});

module.exports = MemberDetails;
