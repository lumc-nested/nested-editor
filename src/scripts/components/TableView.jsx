var Immutable = require('immutable');
var React = require('react');
var {Table} = require('react-bootstrap');

var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var {Pedigree, ObjectRef} = require('../common/Structures');


var genderTable = Immutable.fromJS(AppConstants.Gender).flip();


var MemberRow = React.createClass({

  propTypes: {
    fields: React.PropTypes.object.isRequired,
    memberKey: React.PropTypes.string.isRequired,
    isSelcted: React.PropTypes.bool.isRequired
  },

  handleClick: function() {
    DocumentActions.setFocus(new ObjectRef({
      type: AppConstants.ObjectType.Member,
      key: this.props.memberKey
    }));
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

  propTypes: {
    focus: React.PropTypes.instanceOf(ObjectRef).isRequired,
    pedigree: React.PropTypes.instanceOf(Pedigree).isRequired
  },

  render: function() {
    var focus = this.props.focus;
    var pedigree = this.props.pedigree;
    var rows;

    rows = pedigree.members
      .map((member, memberKey) => {
        var isSelected = focus.type === AppConstants.ObjectType.Member &&
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
