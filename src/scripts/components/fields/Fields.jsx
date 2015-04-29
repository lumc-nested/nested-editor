'use strict';


var Form = require('plexus-form');
// Prevent including the FA stylesheet to the document, we include it manually
// in the iframe.
var Icon = require('react-fa/dist/Icon');
var React = require('react');
var {OverlayTrigger, Tooltip} = require('react-bootstrap');
var validate = require('plexus-validate');

var AppConstants = require('../../constants/AppConstants');
var DocumentActions = require('../../actions/DocumentActions');
var {ObjectRef} = require('../../common/Structures');
var Schemas = require('./Schemas');


var Fields = React.createClass({
  propTypes: {
    objectRef: React.PropTypes.instanceOf(ObjectRef).isRequired,
    appSchemas: React.PropTypes.object.isRequired,
    documentSchemas: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {showSchemas: false};
  },

  openSchemas: function() {
    this.setState({showSchemas: true});
  },

  closeSchemas: function() {
    this.setState({showSchemas: false});
  },

  updateFields: function(fields) {
    DocumentActions.updateFields(this.props.objectRef, fields);
  },

  renderHeading: function() {
    var title;

    // TODO: I'm getting bored from these switch statements, might be better
    //   to define a quick mapping object type->title instead.
    switch (this.props.objectRef.type) {
      case AppConstants.ObjectType.Member:
        title = 'Member';
        break;
      case AppConstants.ObjectType.Nest:
        title = 'Nest';
        break;
      case AppConstants.ObjectType.Pedigree:
      default:
        title = 'Pedigree';
    }

    return (
      <h1>
        {title}
        <OverlayTrigger placement="left" overlay={<Tooltip>Manage custom fields</Tooltip>}>
          <a onClick={this.openSchemas} className="pull-right">
            <Icon name="pencil" />
          </a>
        </OverlayTrigger>
      </h1>
    );
  },

  renderForm: function() {
    var jsonSchema = {
      type: 'object',
      properties: this.props.documentSchemas.mergeDeep(
        this.props.appSchemas
      ).toJS()
    };

    return <Form buttons={['Save']}
                 schema={jsonSchema}
                 validate={validate}
                 values={this.props.fields.toJS()}
                 onSubmit={this.updateFields} />;
  },

  render: function() {
    if (this.state.showSchemas) {
      return <Schemas objectType={this.props.objectRef.type}
                      appSchemas={this.props.appSchemas}
                      documentSchemas={this.props.documentSchemas}
                      onClose={this.closeSchemas} />;
    }

    return (
      <div>
        {this.renderHeading()}
        {this.renderForm()}
      </div>
    );
  }
});


module.exports = Fields;
