// Prevent including the FA stylesheet by a deep require of Icon.
var Icon = require('react-fa/lib/Icon');
var Immutable = require('immutable');
var React = require('react');
var {Button, OverlayTrigger, Tooltip} = require('react-bootstrap');
var validate = require('plexus-validate');

var DocumentActions = require('../actions/DocumentActions');
var Form = require('./forms/Form');


var MemberFields = React.createClass({
  propTypes: {
    member: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    memberKey: React.PropTypes.string.isRequired,
    schemas: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    showSchemas: React.PropTypes.func.isRequired
  },

  contextTypes: {
    showMessage: React.PropTypes.func.isRequired
  },

  shouldComponentUpdate: function(nextProps) {
    var is = Immutable.is;
    var props = this.props;

    // Compare all props, except for the `showSchemas` callback.
    return !is(props.member, nextProps.memberKey) ||
           !is(props.schemas, nextProps.schemas) ||
           props.member !== nextProps.member;
  },

  onSubmit: function(output, value, errors) {
    if (Object.keys(errors).length) {
      this.context.showMessage('Please correct all errors in the form.');
      return;
    }
    DocumentActions.updateMemberFields(this.props.memberKey, output);
  },

  render: function() {
    var button;
    var schema;
    var tooltip;

    schema = {
      type: 'object',
      properties: this.props.schemas.toJS()
    };

    button = (submit) =>
      <Button onClick={submit} bsStyle="primary" className="pull-right">Save fields</Button>;

    tooltip = <Tooltip id="tooltip-manage-custom-fields">Manage custom fields</Tooltip>;

    // When using the `values` prop on `Form`, it's important to implement a
    // smart `shouldComponentUpdate`. Otherwise, form state by the user will
    // be destroyed by rendering.

    return (
      <div>
        <h1>
          Individual
          <OverlayTrigger placement="left" overlay={tooltip}>
            <a onClick={this.props.showSchemas} className="pull-right">
              <Icon name="pencil" />
            </a>
          </OverlayTrigger>
        </h1>
        <Form
          buttons={button}
          schema={schema}
          validate={validate}
          values={this.props.member.toJS()}
          onSubmit={this.onSubmit} />
      </div>
    );
  }
});


module.exports = MemberFields;
