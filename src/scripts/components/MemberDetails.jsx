'use strict';

var React = require('react');
var _ = require('lodash');

var _detailsID = 'member-details';

var MemberDetails = React.createClass({
  getSelected: function() {
    return _.find(this.props.family.members, function(member) {
      return member.id === this.props.focus;
    }, this);
  },

  render: function() {
    var selected = this.getSelected();

    if (selected === undefined) {
      return <div id={_detailsID}><p>No member selected</p></div>;
    }

    var name = selected.name || 'No Name';

    var gender;
    switch (selected.gender) {
      case 1:
        gender = 'male';
        break;
      case 2:
        gender = 'female';
        break;
      default:
        gender = 'gender unknown';
    }

    return (
      <div id={_detailsID}>
        <p>Selected member: {name} ({gender})</p>
      </div>
    );
  }
});

module.exports = MemberDetails;
