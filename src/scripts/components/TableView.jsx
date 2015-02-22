'use strict';


var Immutable = require('immutable');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var PedigreeConstants = require('../constants/PedigreeConstants');
var AppActions = require('../actions/AppActions');


var Table = ReactBootstrap.Table;


var genderTable = Immutable.fromJS(PedigreeConstants.Gender).flip();


var MemberRow = React.createClass({
  handleClick: function() {
    AppActions.changeFocus(
      PedigreeConstants.FocusLevel.Member,
      this.props.memberKey
    );
  },

  render: function() {
    var gender = genderTable.get(this.props.member.get('gender'),
                                 PedigreeConstants.Gender.Unknown);

    return (
      <tr className={(this.props.isSelected) ? 'info' : ''} onClick={this.handleClick}>
        <td>{this.props.memberKey}</td>
        <td>{this.props.member.get('name')}</td>
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
        var isSelected = focus.level === PedigreeConstants.FocusLevel.Member &&
                         focus.key === memberKey;
        return <MemberRow key={'member-' + memberKey}
                          member={member}
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
