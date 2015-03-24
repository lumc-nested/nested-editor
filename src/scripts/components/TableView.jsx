'use strict';


var Immutable = require('immutable');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');


var Table = ReactBootstrap.Table;


var genderTable = Immutable.fromJS(AppConstants.Gender).flip();


var MemberRow = React.createClass({
  handleClick: function() {
    DocumentActions.setFocus(
      AppConstants.FocusLevel.Member,
      this.props.memberKey
    );
  },

  render: function() {
    var gender = genderTable.get(this.props.fields.get('gender'),
                                 AppConstants.Gender.Unknown);

    return (
      <tr className={(this.props.isSelected) ? 'info' : ''} onClick={this.handleClick}>
        <td>{this.props.memberKey}</td>
        <td>{this.props.fields.get('name')}</td>
        <td>{gender}</td>
      </tr>);
  }
});


var TableView = React.createClass({
  render: function() {
    var focus = this.props.focus;
    var pedigree = this.props.pedigree;
    var rows;

    rows = pedigree.members
      .map((member, memberKey) => {
        var isSelected = focus.level === AppConstants.FocusLevel.Member &&
                         focus.key === memberKey;
        return <MemberRow key={'member-' + memberKey}
                          fields={member.fields}
                          memberKey={memberKey}
                          isSelected={isSelected} />;
      })
      .sortBy(row => row.props.memberKey)
      .toArray();

    // TODO: Better sorting.

    return (
      <Table striped hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  }
});


module.exports = TableView;
