'use strict';


var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var AppConstants = require('../constants/AppConstants');
var DocumentActions = require('../actions/DocumentActions');
var {Pedigree, Ref} = require('../common/Structures');
var {getFatherAndMother, getSpouses, memberAsString} = require('../common/Utils');


var Button = ReactBootstrap.Button;


var TableSidebar = React.createClass({
  propTypes: {
    focus: React.PropTypes.instanceOf(Ref).isRequired,
    pedigree: React.PropTypes.instanceOf(Pedigree).isRequired
  },

  focusMember: function(memberKey) {
    DocumentActions.setFocus(new Ref({
      type: AppConstants.ObjectType.Member,
      key: memberKey
    }));
  },

  render: function() {
    var focus = this.props.focus;
    var fields = {};
    var father;
    var member;
    var members;
    var mother;

    if (focus.type !== AppConstants.ObjectType.Member) {
      return <p>Click on a member to see relationships.</p>;
    }

    members = this.props.pedigree.members;
    member = members.get(focus.key);
    [father, mother] = getFatherAndMother(member.parents, members);

    if (father) {
      fields.father = (
        <div>
          <label>Father</label>
          <Button bsStyle="link" onClick={this.focusMember.bind(this, father)}>
            {memberAsString(father, members)}
          </Button>
        </div>
      );
    }

    if (mother) {
      fields.mother = (
        <div>
          <label>Mother</label>
          <Button bsStyle="link" onClick={this.focusMember.bind(this, mother)}>
            {memberAsString(mother, members)}
          </Button>
        </div>
      );
    }

    getSpouses(focus.key, this.props.pedigree.nests).forEach(spouseKey => {
      fields['_spouse-' + spouseKey] = (
        <div>
          <label>Spouse</label>
          <Button bsStyle="link" onClick={this.focusMember.bind(this, spouseKey)}>
            {memberAsString(spouseKey, members)}
          </Button>
        </div>
      );
    });

    // TODO: This needs restyling.

    return (
      <fieldset>
        <legend>{'Member (' + focus.key + ')'}</legend>
        {React.addons.createFragment(fields)}
      </fieldset>
    );
  }
});


module.exports = TableSidebar;
