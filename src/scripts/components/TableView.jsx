'use strict';


var Immutable = require('immutable');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var PC = require('../constants/PedigreeConstants');
var AppActions = require('../actions/AppActions.js');


var Table = ReactBootstrap.Table;


// TODO: Wouldn't it make more sense to invert the map in PedigreeConstants
//   in the first place?
var genderTable = Immutable.fromJS(PC.Gender).flip();


var MemberRow = React.createClass({
  handleClick: function() {
    AppActions.changeFocus({
      'level': PC.FocusLevel.Member,
      'key': this.props.member.get('_id')
    });
  },

  render: function() {
    var member = this.props.member;
    var gender = genderTable.get(member.get('gender'));
    return (
      <tr className={(this.props.selected) ? 'info' : ''} onClick={this.handleClick}>
        <td>{member.get('_id')}</td>
        <td>{member.get('name')}</td>
        <td>{gender}</td>
      </tr>);
  }
});


var TableView = React.createClass({
  render: function() {
    var focus;
    var focussed;
    var rows;

    if (this.props.pedigree === undefined) {
      return <p>No members</p>;
    }

    focus = this.props.focus;
    focussed = focus !== undefined && focus.get('level') === PC.FocusLevel.Member;

    rows = this.props.pedigree.get('members').map(function(member) {
      var selected = focussed && focus.get('key') === member.get('_id');
      return <MemberRow member={member} selected={selected} />;
    }).toArray();

    return (
      <Table striped hover>
        <thead>
          <tr>
            <th>ID</th>
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
