'use strict';

var React = require('react');
var validate = require('plexus-validate');
var Form = require('plexus-form');
var _ = require('lodash');

var schema = require('../../schema.json');

var _detailsID = 'member-details';

var MemberDetails = React.createClass({

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
    _.assign(this.props.selected.data, data);
  },

  render: function() {
    var selected = this.props.selected;

    if (selected === undefined) {
      return <div id={_detailsID}><p>No member selected</p></div>;
    }

    return (
      <div id={_detailsID}>
        <Form
          buttons={['Save']}
          schema={this.state.schema}
          validate={validate}
          values={selected.data}
          onSubmit={this.onFormSubmit}
        />
      </div>
    );
  }
});

module.exports = MemberDetails;
